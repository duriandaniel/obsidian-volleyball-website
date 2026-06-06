import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { priceCampCart, CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";

const JERSEY_SIZES = ["XS", "S", "M", "L", "XL"] as const;

const Body = z.object({
  items: z.array(z.object({ session_id: z.string().uuid(), is_half_day: z.boolean() })).min(1).max(20),
  // Optional jersey add-on. Opt-in only; size required when add === true.
  jersey: z
    .object({
      add: z.boolean().default(false),
      size: z.enum(JERSEY_SIZES).nullable().optional(),
    })
    .optional(),
  parent: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(5).max(40),
    source: z.enum(["", "google", "instagram", "facebook", "word_of_mouth", "flyer", "newsletter"]).optional(),
  }),
  kid: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    year_at_school: z.string().max(40).optional().nullable(),
    volleyball_level: z.enum(["beginner", "intermediate", "advanced"]).optional().nullable(),
    school_name: z.string().max(200).optional().nullable(),
    medical_notes: z.string().max(2000).optional().nullable(),
    photo_consent: z.boolean().default(false),
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

  // Validate sessions exist + are camp + not full + scheduled
  const sessionIds = body.items.map((i) => i.session_id);
  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, status, program_id, capacity_override, programs:program_id(id,title,type,default_capacity)")
    .in("id", sessionIds);
  if (!sessions || sessions.length !== sessionIds.length) {
    return NextResponse.json({ error: "One or more sessions not found" }, { status: 400 });
  }
  for (const s of sessions) {
    if (s.status !== "scheduled") {
      return NextResponse.json({ error: `Session ${s.id} is not bookable` }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((s.programs as any)?.type !== "camp") {
      return NextResponse.json({ error: `Session ${s.id} is not a camp session` }, { status: 400 });
    }
  }

  // Capacity check (compare current confirmed/pending count to capacity)
  const { data: existingBookings } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", sessionIds)
    .in("status", ["confirmed", "pending"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of existingBookings ?? []) counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);
  for (const s of sessions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capacity = s.capacity_override ?? (s.programs as any).default_capacity;
    if ((counts.get(s.id) ?? 0) >= capacity) {
      return NextResponse.json({ error: `Session ${s.id} is full` }, { status: 409 });
    }
  }

  // Authoritative price: always recomputed server-side, never trusted from the client.
  const pricing = priceCampCart(body.items);
  if (pricing.total_cents <= 0) {
    return NextResponse.json({ error: "Total must be positive" }, { status: 400 });
  }

  // Optional jersey add-on (opt-in only; size required when added).
  const jerseyAdd = body.jersey?.add === true;
  const jerseySize = body.jersey?.size ?? null;
  if (jerseyAdd && !jerseySize) {
    return NextResponse.json({ error: "Please choose a jersey size" }, { status: 400 });
  }
  const jerseyCents = jerseyAdd ? CAMP_JERSEY_CENTS : 0;

  const dayLabel =
    [
      pricing.full_days > 0 ? `${pricing.full_days} full day${pricing.full_days === 1 ? "" : "s"}` : "",
      pricing.half_days > 0 ? `${pricing.half_days} half day${pricing.half_days === 1 ? "" : "s"}` : "",
    ]
      .filter(Boolean)
      .join(" + ") || "camp";

  // Upsert customer by email (case-insensitive). Always update name/phone with latest input.
  const email = body.parent.email.toLowerCase();
  let customerId: string;
  {
    const { data: existing } = await sb
      .from("customers")
      .select("id")
      .eq("email", email)
      .is("deleted_at", null)
      .maybeSingle();
    if (existing) {
      customerId = existing.id;
      await sb
        .from("customers")
        .update({
          first_name: body.parent.first_name,
          last_name: body.parent.last_name,
          phone: body.parent.phone,
        })
        .eq("id", customerId);
    } else {
      const { data: created, error: cErr } = await sb
        .from("customers")
        .insert({
          email,
          first_name: body.parent.first_name,
          last_name: body.parent.last_name,
          phone: body.parent.phone,
          photo_consent: body.kid.photo_consent,
          source: body.parent.source || null,
        })
        .select("id")
        .single();
      if (cErr) {
        console.error("customer insert", cErr);
        return NextResponse.json({ error: "Could not save parent details" }, { status: 500 });
      }
      customerId = created.id;
    }
  }

  // Find or create participant by (customer_id, first_name, last_name) case-insensitive
  let participantId: string;
  {
    const { data: existingPart } = await sb
      .from("participants")
      .select("id")
      .eq("customer_id", customerId)
      .ilike("first_name", body.kid.first_name)
      .ilike("last_name", body.kid.last_name)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingPart) {
      participantId = existingPart.id;
      await sb
        .from("participants")
        .update({
          year_at_school: body.kid.year_at_school ?? null,
          volleyball_level: body.kid.volleyball_level ?? null,
          school_name: body.kid.school_name ?? null,
          medical_notes: body.kid.medical_notes ?? null,
        })
        .eq("id", participantId);
    } else {
      const { data: createdPart, error: pErr } = await sb
        .from("participants")
        .insert({
          customer_id: customerId,
          first_name: body.kid.first_name,
          last_name: body.kid.last_name,
          year_at_school: body.kid.year_at_school ?? null,
          volleyball_level: body.kid.volleyball_level ?? null,
          school_name: body.kid.school_name ?? null,
          medical_notes: body.kid.medical_notes ?? null,
        })
        .select("id")
        .single();
      if (pErr) {
        console.error("participant insert", pErr);
        return NextResponse.json({ error: "Could not save child details" }, { status: 500 });
      }
      participantId = createdPart.id;
    }
  }

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
    allow_promotion_codes: true, // parents can enter a discount code at checkout
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: `Obsidian Volleyball Camp · ${dayLabel}`,
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
          unit_amount: pricing.total_cents,
        },
        quantity: 1,
      },
      ...(jerseyAdd
        ? [
            {
              price_data: {
                currency: "aud" as const,
                product_data: { name: `Obsidian training jersey (Size ${jerseySize})` },
                unit_amount: CAMP_JERSEY_CENTS,
              },
              quantity: 1,
            },
          ]
        : []),
    ],
    customer_email: email,
    return_url: `${appUrl}/booking/camps/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "camp",
      customer_id: customerId,
      participant_id: participantId,
      items: JSON.stringify(body.items),
      subtotal_cents: String(pricing.subtotal_cents),
      discount_cents: String(pricing.discount_cents),
      camp_total_cents: String(pricing.total_cents),
      jersey_cents: String(jerseyCents),
      jersey_size: jerseyAdd ? String(jerseySize) : "none",
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
