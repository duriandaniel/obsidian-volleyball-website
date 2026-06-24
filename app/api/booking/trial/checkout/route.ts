import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { TRIAL_PRICE_CENTS, TRIAL_WINDOW_DAYS, trialPriceCentsForVenue } from "@/lib/booking/pricing";
import { sendEmail } from "@/lib/email/send";

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

  // Price depends on venue: Kellyville trials are free during the launch promo.
  const { data: venue } = await sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle();
  const venueName = venue ? (venue.address ? `${venue.name}, ${venue.address}` : venue.name) : "Obsidian Volleyball Academy";
  const priceCents = trialPriceCentsForVenue(venue?.name);

  // FREE trial: no Stripe. Confirm the booking directly, email the parent, and
  // tell the client to go straight to the success page.
  if (priceCents === 0) {
    const { count: dup } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("session_id", trialSession.id)
      .eq("participant_id", participantId)
      .is("deleted_at", null);
    if (!dup) {
      const { error: bErr } = await sb.from("bookings").insert({
        session_id: trialSession.id,
        participant_id: participantId,
        customer_id: customerId,
        source: "trial",
        status: "confirmed",
        paid_amount_cents: 0,
        paid_at: new Date().toISOString(),
      });
      if (bErr) return NextResponse.json({ error: "Could not confirm your free trial" }, { status: 500 });
      await sb.from("audit_log").insert({
        actor_role: "system",
        action: "trial.create",
        entity_type: "program",
        entity_id: program.id,
        after: { program_id: program.id, session_id: trialSession.id, total_cents: 0, free: true },
      });
    }
    try {
      const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney" });
      const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
      const when = `${fmtDay(trialSession.starts_at)} · ${fmtTime(trialSession.starts_at)}`;
      await sendEmail({
        to: email,
        subject: `Free trial booked: ${program.title}`,
        template: "trial_free_confirmation",
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#7E57C2;margin-bottom:8px;">Trial booked.</h2>
          <p>Hi ${body.parent.first_name},</p>
          <p>Your free trial class is booked.</p>
          <p style="background:#f6f3ff;padding:12px 16px;border-radius:6px;"><strong>${program.title}</strong><br>${when}<br>${venueName}</p>
          <p>Wear suitable indoor court shoes. We provide all volleyball gear.</p>
          <p style="font-size:13px;color:#666;">Want to join for the term afterwards? Just reply to this email.</p>
          <p>See you on court!<br>Obsidian Volleyball Academy</p>
        </div>`,
        text: `Trial booked.\n\nYour free trial class is booked.\n\n${program.title}\n${when}\n${venueName}\n\nWear suitable indoor court shoes.\n\nObsidian Volleyball Academy`,
      });
    } catch {
      // best-effort; booking already confirmed
    }
    return NextResponse.json({ free: true, redirect_url: `${appUrl}/booking/term/success?free=1${bypassQS}` });
  }

  const checkout = await stripe()
    .checkout.sessions.create({
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
    })
    .catch((err) => {
      console.error("trial checkout: stripe session create failed", err);
      return null;
    });
  if (!checkout) {
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
