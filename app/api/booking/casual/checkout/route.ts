import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { CASUAL_PRICE_CENTS } from "@/lib/booking/pricing";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Junior casual / drop-in: book one or more individual classes at the casual
// rate (no term commitment, no enrolment row). One booking per chosen session.
const Body = z.object({
  program_id: z.string().regex(UUID),
  session_ids: z.array(z.string().regex(UUID)).min(1).max(12),
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
    return NextResponse.json({ error: "Casual booking is for junior classes; adults use the social scrim flow" }, { status: 400 });
  }

  // Validate chosen sessions belong to this program, scheduled, in the future.
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
    return NextResponse.json({ error: "One or more selected classes are no longer available" }, { status: 400 });
  }

  // Capacity check per session.
  const { data: existing } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", body.session_ids)
    .in("status", ["confirmed", "pending", "attended"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of existing ?? []) counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);
  for (const s of sessions) {
    if ((counts.get(s.id) ?? 0) >= program.default_capacity) {
      return NextResponse.json({ error: "One of the selected classes is full" }, { status: 409 });
    }
  }

  // Upsert customer (parent)
  const email = body.parent.email.toLowerCase();
  let customerId: string;
  {
    const { data: ex } = await sb.from("customers").select("id").eq("email", email).is("deleted_at", null).maybeSingle();
    if (ex) {
      customerId = ex.id;
      await sb.from("customers").update({ first_name: body.parent.first_name, last_name: body.parent.last_name, phone: body.parent.phone }).eq("id", customerId);
    } else {
      const { data: created, error: cErr } = await sb
        .from("customers")
        .insert({ email, first_name: body.parent.first_name, last_name: body.parent.last_name, phone: body.parent.phone, photo_consent: body.kid.photo_consent, source: body.parent.source || null })
        .select("id")
        .single();
      if (cErr) return NextResponse.json({ error: "Could not save parent details" }, { status: 500 });
      customerId = created.id;
    }
  }

  // Find or create participant (the child)
  let participantId: string;
  {
    const { data: ep } = await sb
      .from("participants").select("id").eq("customer_id", customerId)
      .ilike("first_name", body.kid.first_name).ilike("last_name", body.kid.last_name).is("deleted_at", null).maybeSingle();
    if (ep) {
      participantId = ep.id;
      await sb.from("participants").update({ year_at_school: body.kid.year_at_school ?? null, volleyball_level: body.kid.volleyball_level ?? null, school_name: body.kid.school_name ?? null, medical_notes: body.kid.medical_notes ?? null }).eq("id", participantId);
    } else {
      const { data: cp, error: pErr } = await sb
        .from("participants")
        .insert({ customer_id: customerId, first_name: body.kid.first_name, last_name: body.kid.last_name, year_at_school: body.kid.year_at_school ?? null, volleyball_level: body.kid.volleyball_level ?? null, school_name: body.kid.school_name ?? null, medical_notes: body.kid.medical_notes ?? null })
        .select("id").single();
      if (pErr) return NextResponse.json({ error: "Could not save child details" }, { status: 500 });
      participantId = cp.id;
    }
  }

  const count = sessions.length;
  const total = CASUAL_PRICE_CENTS * count;

  const reqUrl = new URL(req.url);
  const appUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  const bypass = reqUrl.searchParams.get("x-vercel-protection-bypass");
  const bypassQS = bypass ? `&x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true` : "";

  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: `${program.title} · ${count} casual class${count === 1 ? "" : "es"}`,
            description: sessions.map((s) => new Date(s.starts_at).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "Australia/Sydney" })).join(", "),
          },
          unit_amount: CASUAL_PRICE_CENTS,
        },
        quantity: count,
      },
    ],
    customer_email: email,
    return_url: `${appUrl}/booking/term/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "casual",
      program_id: program.id,
      customer_id: customerId,
      participant_id: participantId,
      session_ids: sessions.map((s) => s.id).join(","),
      per_session_cents: String(CASUAL_PRICE_CENTS),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
