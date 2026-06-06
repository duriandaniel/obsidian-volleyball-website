import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { TRIAL_PRICE_CENTS, TRIAL_WINDOW_DAYS } from "@/lib/booking/pricing";

// Paid trial class: books the next upcoming session of a junior class at the
// trial price. A one-off paid trial — not credited toward term. One trial per
// athlete is a stated policy, not enforced here.
const Body = z.object({
  program_id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
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

  const { data: program } = await sb
    .from("programs")
    .select("id, slug, title, type, status, default_capacity, age_min, venue_id")
    .eq("id", body.program_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  if (program.type !== "term" || program.status !== "published") {
    return NextResponse.json({ error: "Program not open" }, { status: 400 });
  }
  if (isAdultProgram(program)) {
    return NextResponse.json({ error: "Trials are for junior classes only" }, { status: 400 });
  }

  // Next upcoming session = the trial session.
  const nowIso = new Date().toISOString();
  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at")
    .eq("program_id", program.id)
    .eq("status", "scheduled")
    .gte("starts_at", nowIso)
    .is("deleted_at", null)
    .order("starts_at")
    .limit(1);
  const trialSession = sessions?.[0];
  if (!trialSession) {
    return NextResponse.json({ error: "No upcoming sessions in this program" }, { status: 400 });
  }
  // Trials only for a session within the next two weeks.
  const cutoffIso = new Date(Date.now() + TRIAL_WINDOW_DAYS * 86400_000).toISOString();
  if (trialSession.starts_at > cutoffIso) {
    return NextResponse.json({ error: "No trial available for this class right now" }, { status: 400 });
  }

  // Capacity check on the trial session.
  const { count } = await sb
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("session_id", trialSession.id)
    .in("status", ["confirmed", "pending", "attended"])
    .is("deleted_at", null);
  if ((count ?? 0) >= program.default_capacity) {
    return NextResponse.json({ error: "This class is full" }, { status: 409 });
  }

  // Upsert customer
  const email = body.parent.email.toLowerCase();
  let customerId: string;
  {
    const { data: existing } = await sb.from("customers").select("id").eq("email", email).is("deleted_at", null).maybeSingle();
    if (existing) {
      customerId = existing.id;
      await sb
        .from("customers")
        .update({ first_name: body.parent.first_name, last_name: body.parent.last_name, phone: body.parent.phone })
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
      if (cErr) return NextResponse.json({ error: "Could not save parent details" }, { status: 500 });
      customerId = created.id;
    }
  }

  // Find or create participant (the child)
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
      if (pErr) return NextResponse.json({ error: "Could not save child details" }, { status: 500 });
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
            name: `${program.title} · 1-week trial`,
            description: "One junior class trial.",
          },
          unit_amount: TRIAL_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    customer_email: email,
    return_url: `${appUrl}/booking/term/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "trial",
      program_id: program.id,
      customer_id: customerId,
      participant_id: participantId,
      session_id: trialSession.id,
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
