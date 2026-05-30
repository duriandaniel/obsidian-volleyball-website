import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { isAdultProgram } from "@/lib/booking/audience";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const Body = z.object({
  program_id: z.string().regex(UUID),
  session_ids: z.array(z.string().regex(UUID)).min(1).max(12),
  player: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(5).max(40),
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

  const { data: program } = await sb
    .from("programs")
    .select("id, slug, title, type, status, default_capacity, pricing_rule_id, age_min, venue_id")
    .eq("id", body.program_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  if (program.type !== "term" || program.status !== "published") {
    return NextResponse.json({ error: "Program not open" }, { status: 400 });
  }
  if (!isAdultProgram(program)) {
    return NextResponse.json({ error: "This program is not a drop-in scrim" }, { status: 400 });
  }

  const { data: rule } = await sb
    .from("pricing_rules")
    .select("term_per_session_cents")
    .eq("id", program.pricing_rule_id ?? "")
    .maybeSingle();
  const perSessionCents = rule?.term_per_session_cents ?? 0;
  if (perSessionCents <= 0) return NextResponse.json({ error: "Program has no price configured" }, { status: 400 });

  // Validate the chosen sessions: belong to this program, scheduled, in the future, not full.
  const now = new Date().toISOString();
  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at")
    .eq("program_id", program.id)
    .in("id", body.session_ids)
    .eq("status", "scheduled")
    .gte("starts_at", now)
    .is("deleted_at", null)
    .order("starts_at");
  if (!sessions || sessions.length !== body.session_ids.length) {
    return NextResponse.json({ error: "One or more selected nights are no longer available" }, { status: 400 });
  }

  const { data: existingBookings } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", body.session_ids)
    .in("status", ["confirmed", "pending", "attended"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of existingBookings ?? []) counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);
  for (const s of sessions) {
    if ((counts.get(s.id) ?? 0) >= program.default_capacity) {
      return NextResponse.json({ error: "One of the selected nights is full" }, { status: 409 });
    }
  }

  // Upsert customer (the adult player) by email
  const email = body.player.email.toLowerCase();
  let customerId: string;
  {
    const { data: existing } = await sb.from("customers").select("id").eq("email", email).is("deleted_at", null).maybeSingle();
    if (existing) {
      customerId = existing.id;
      await sb
        .from("customers")
        .update({ first_name: body.player.first_name, last_name: body.player.last_name, phone: body.player.phone })
        .eq("id", customerId);
    } else {
      const { data: created, error: cErr } = await sb
        .from("customers")
        .insert({
          email,
          first_name: body.player.first_name,
          last_name: body.player.last_name,
          phone: body.player.phone,
        })
        .select("id")
        .single();
      if (cErr) return NextResponse.json({ error: "Could not save your details" }, { status: 500 });
      customerId = created.id;
    }
  }

  // For an adult scrim the player is their own participant.
  let participantId: string;
  {
    const { data: existingPart } = await sb
      .from("participants")
      .select("id")
      .eq("customer_id", customerId)
      .ilike("first_name", body.player.first_name)
      .ilike("last_name", body.player.last_name)
      .is("deleted_at", null)
      .maybeSingle();
    if (existingPart) {
      participantId = existingPart.id;
    } else {
      const { data: createdPart, error: pErr } = await sb
        .from("participants")
        .insert({ customer_id: customerId, first_name: body.player.first_name, last_name: body.player.last_name })
        .select("id")
        .single();
      if (pErr) return NextResponse.json({ error: "Could not save your details" }, { status: 500 });
      participantId = createdPart.id;
    }
  }

  const count = sessions.length;
  const total = perSessionCents * count;

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
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: `${program.title} · ${count} night${count === 1 ? "" : "s"}`,
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
          unit_amount: total,
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    return_url: `${appUrl}/booking/term/adult/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "dropin",
      program_id: program.id,
      customer_id: customerId,
      participant_id: participantId,
      session_ids: JSON.stringify(sessions.map((s) => s.id)),
      per_session_cents: String(perSessionCents),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
