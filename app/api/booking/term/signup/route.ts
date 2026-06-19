import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { weekday, timeRange } from "@/lib/booking/load";
import { sendEmail } from "@/lib/email/send";

// Term enrolment signup: NO payment. Captures the enrolment, links it into the
// CRM (customers/participants), records a term_signups row for follow-up, and
// emails the parent + notifies the academy. Dan sends a Stripe payment link
// manually after lesson 2 (no auto-charge).
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
    injury_ack: z.boolean().default(false),
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
    .select("id, slug, title, type, status, age_min, venue_id")
    .eq("id", body.program_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!program) return NextResponse.json({ error: "Program not found" }, { status: 404 });
  if (program.type !== "term" || program.status !== "published") {
    return NextResponse.json({ error: "Program not open" }, { status: 400 });
  }
  if (isAdultProgram(program)) {
    return NextResponse.json({ error: "This signup is for junior classes only" }, { status: 400 });
  }

  // Venue + first upcoming session, for human-readable labels.
  const [{ data: venue }, { data: sessions }] = await Promise.all([
    sb.from("venues").select("name").eq("id", program.venue_id).maybeSingle(),
    sb
      .from("sessions")
      .select("starts_at, ends_at")
      .eq("program_id", program.id)
      .eq("status", "scheduled")
      .gte("starts_at", new Date().toISOString())
      .is("deleted_at", null)
      .order("starts_at")
      .limit(1),
  ]);
  const venueName = venue?.name ?? "TBA";
  const first = sessions?.[0];
  const dayLabel = first ? weekday(first.starts_at) : "";
  const timeLabel = first ? timeRange(first.starts_at, first.ends_at) : "";

  // Upsert customer (parent)
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

  // Upsert participant (child)
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

  // Record the signup for follow-up.
  const { error: sErr } = await sb.from("term_signups").insert({
    program_id: program.id,
    program_slug: program.slug,
    program_title: program.title,
    venue_name: venueName,
    day_label: dayLabel,
    time_label: timeLabel,
    customer_id: customerId,
    participant_id: participantId,
    parent_first_name: body.parent.first_name,
    parent_last_name: body.parent.last_name,
    parent_email: email,
    parent_phone: body.parent.phone,
    source: body.parent.source || null,
    child_first_name: body.kid.first_name,
    child_last_name: body.kid.last_name,
    child_year_at_school: body.kid.year_at_school ?? null,
    child_level: body.kid.volleyball_level ?? null,
    child_school_name: body.kid.school_name ?? null,
    medical_notes: body.kid.medical_notes ?? null,
    photo_consent: body.kid.photo_consent,
    injury_ack: body.kid.injury_ack,
    status: "new",
  });
  if (sErr) {
    // term_signups table missing or write failed — surface a clear error.
    return NextResponse.json({ error: "Could not save your enrolment. Please try again or contact us." }, { status: 500 });
  }

  const classLine = [program.title, dayLabel, timeLabel, venueName].filter(Boolean).join(" · ");

  // Parent confirmation (best-effort; don't fail the signup if email hiccups).
  try {
    await sendEmail({
      to: email,
      subject: `You're enrolled: ${program.title}`,
      template: "term_signup_parent",
      html: `
        <p>Hi ${body.parent.first_name},</p>
        <p>Thanks for enrolling ${body.kid.first_name} at Obsidian Volleyball Academy.</p>
        <p><strong>${classLine}</strong></p>
        <p>Your first two lessons are free to try, with nothing to pay now. If it's the right fit
        and you'd like to keep the spot, we'll send you a payment link for the full term (including
        those two weeks). If it's not for you, just let us know after the two weeks and there's no charge.</p>
        <p>We'll be in touch with the details. See you on court!</p>
        <p>— Obsidian Volleyball Academy</p>
      `,
    });
  } catch {
    // logged in email_log; signup already saved
  }

  // Academy notification.
  try {
    const owner = process.env.OWNER_EMAIL || process.env.SMTP_USER;
    if (owner) {
      await sendEmail({
        to: owner,
        subject: `New enrolment: ${body.kid.first_name} ${body.kid.last_name} · ${program.title}`,
        template: "term_signup_owner",
        html: `
          <p>New term enrolment signup (no payment taken).</p>
          <ul>
            <li><strong>Class:</strong> ${classLine}</li>
            <li><strong>Child:</strong> ${body.kid.first_name} ${body.kid.last_name} (${body.kid.volleyball_level ?? "level n/a"}, ${body.kid.year_at_school ?? "year n/a"})</li>
            <li><strong>Parent:</strong> ${body.parent.first_name} ${body.parent.last_name} · ${email} · ${body.parent.phone}</li>
            <li><strong>Source:</strong> ${body.parent.source || "n/a"}</li>
            <li><strong>Medical:</strong> ${body.kid.medical_notes || "none"}</li>
          </ul>
          <p>Follow up, then send a Stripe payment link for the full term after lesson 2.</p>
        `,
      });
    }
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true });
}
