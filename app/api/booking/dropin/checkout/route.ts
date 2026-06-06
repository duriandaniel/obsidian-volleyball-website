import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Body = z.object({
  session_ids: z.array(z.string().regex(UUID)).min(1).max(12),
  jersey: z.object({ add: z.boolean().default(false) }).optional(),
  player: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().min(5).max(40),
    level: z.enum(["beginner", "social_player", "svl_player"]),
    source: z.enum(["", "google", "instagram", "facebook", "word_of_mouth", "flyer", "newsletter"]).optional(),
    marketing_consent: z.literal(true, { message: "Marketing consent is required" }),
  }),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid request: ${msg}` }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  // Load the chosen sessions with their parent program. Sessions may span
  // multiple adult programs (Tue/Wed/Fri) in a single booking.
  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, status, program_id, programs:program_id(id, type, status, age_min, default_capacity, pricing_rule_id)")
    .in("id", body.session_ids)
    .order("starts_at");
  if (!sessions || sessions.length !== body.session_ids.length) {
    return NextResponse.json({ error: "One or more selected nights are no longer available" }, { status: 400 });
  }

  // Validate every session is a published, upcoming, adult drop-in night.
  const ruleIds = new Set<string>();
  for (const s of sessions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prog = s.programs as any;
    if (s.status !== "scheduled" || s.starts_at < now) {
      return NextResponse.json({ error: "One of the selected nights is no longer bookable" }, { status: 400 });
    }
    if (!prog || prog.type !== "term" || prog.status !== "published" || !isAdultProgram(prog)) {
      return NextResponse.json({ error: "One of the selected nights is not an adult session" }, { status: 400 });
    }
    if (prog.pricing_rule_id) ruleIds.add(prog.pricing_rule_id);
  }

  // Per-session price (all adult scrims share the same $20 rule).
  const { data: rules } = await sb
    .from("pricing_rules")
    .select("id, term_per_session_cents")
    .in("id", Array.from(ruleIds));
  const centsByRule = new Map((rules ?? []).map((r) => [r.id, r.term_per_session_cents ?? 0]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perSessionCentsSet = new Set(sessions.map((s) => centsByRule.get((s.programs as any).pricing_rule_id) ?? 0));
  if (perSessionCentsSet.size !== 1 || perSessionCentsSet.has(0)) {
    return NextResponse.json({ error: "Pricing is not configured for one of the nights" }, { status: 400 });
  }
  const perSessionCents = Array.from(perSessionCentsSet)[0];

  // Capacity check per session.
  const { data: existingBookings } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", body.session_ids)
    .in("status", ["confirmed", "pending", "attended"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of existingBookings ?? []) counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);
  for (const s of sessions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cap = (s.programs as any).default_capacity;
    if ((counts.get(s.id) ?? 0) >= cap) {
      return NextResponse.json({ error: "One of the selected nights is full" }, { status: 409 });
    }
  }

  // Split the single name field into first/last for the participant record.
  const parts = body.player.name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");

  // Upsert customer (the adult player). Marketing consent + source captured here.
  const email = body.player.email.toLowerCase();
  let customerId: string;
  {
    const { data: existing } = await sb.from("customers").select("id").eq("email", email).is("deleted_at", null).maybeSingle();
    const fields = {
      first_name: firstName,
      last_name: lastName,
      phone: body.player.phone,
      photo_consent: true,
      source: body.player.source || null,
    };
    if (existing) {
      customerId = existing.id;
      await sb.from("customers").update(fields).eq("id", customerId);
    } else {
      const { data: created, error: cErr } = await sb.from("customers").insert({ email, ...fields }).select("id").single();
      if (cErr) return NextResponse.json({ error: "Could not save your details" }, { status: 500 });
      customerId = created.id;
    }
  }

  // The adult is their own participant.
  let participantId: string;
  {
    const { data: existingPart } = await sb
      .from("participants")
      .select("id")
      .eq("customer_id", customerId)
      .ilike("first_name", firstName)
      .ilike("last_name", lastName || "")
      .is("deleted_at", null)
      .maybeSingle();
    if (existingPart) {
      participantId = existingPart.id;
    } else {
      const { data: createdPart, error: pErr } = await sb
        .from("participants")
        .insert({ customer_id: customerId, first_name: firstName, last_name: lastName })
        .select("id")
        .single();
      if (pErr) return NextResponse.json({ error: "Could not save your details" }, { status: 500 });
      participantId = createdPart.id;
    }
  }

  const count = sessions.length;
  const total = perSessionCents * count;

  // Optional jersey add-on (opt-in; size chosen on collection).
  const jerseyAdd = body.jersey?.add === true;
  const jerseyCents = jerseyAdd ? CAMP_JERSEY_CENTS : 0;

  const reqUrl = new URL(req.url);
  const appUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  const bypass = reqUrl.searchParams.get("x-vercel-protection-bypass");
  const bypassQS = bypass
    ? `&x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true`
    : "";

  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    payment_method_types: ["card"],
    allow_promotion_codes: true, // adults can enter a coupon at checkout
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: `Adult Social Scrim · ${count} night${count === 1 ? "" : "s"}`,
            description: sessions
              .map((s) =>
                new Date(s.starts_at).toLocaleDateString("en-AU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: "Australia/Sydney",
                })
              )
              .join(", "),
          },
          unit_amount: perSessionCents,
        },
        quantity: count,
      },
      ...(jerseyAdd
        ? [
            {
              price_data: {
                currency: "aud" as const,
                product_data: { name: "Obsidian training jersey" },
                unit_amount: CAMP_JERSEY_CENTS,
              },
              quantity: 1,
            },
          ]
        : []),
    ],
    customer_email: email,
    return_url: `${appUrl}/booking/adult/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "dropin",
      customer_id: customerId,
      participant_id: participantId,
      session_ids: sessions.map((s) => s.id).join(","),
      per_session_cents: String(perSessionCents),
      level: body.player.level,
      jersey_size: jerseyAdd ? "TBC" : "none",
      jersey_cents: String(jerseyCents),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
