import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { addToWaitlist, describeSession, waitlistFmtDay, waitlistFmtTime } from "@/lib/booking/waitlist";

// Join the waitlist for a sold-out session. Generic across session types
// (camp days, term classes, trials, adult scrims) — the UI decides where the
// form appears; this route just needs a session id.
const Body = z.object({
  session_id: z.string().uuid(),
  customer_name: z.string().min(1).max(120),
  kid_name: z.string().max(120).optional().nullable(),
  email: z.string().email(),
  phone: z.string().min(5).max(40),
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

  // Session must exist, be scheduled, and still be in the future.
  const { data: session } = await sb
    .from("sessions")
    .select("id, starts_at, status")
    .eq("id", body.session_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!session || session.status !== "scheduled") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (session.starts_at <= new Date().toISOString()) {
    return NextResponse.json({ error: "This session has already started" }, { status: 400 });
  }

  let added: boolean;
  try {
    added = await addToWaitlist(sb, {
      sessionIds: [body.session_id],
      customerName: body.customer_name.trim(),
      kidName: body.kid_name?.trim() || null,
      email: body.email,
      phone: body.phone.trim(),
    });
  } catch (err) {
    console.error("waitlist join failed", err);
    return NextResponse.json({ error: "Could not join the waitlist. Please try again." }, { status: 500 });
  }

  // Already on the list → treat as success (idempotent join), skip the noise.
  if (!added) return NextResponse.json({ ok: true, already: true });

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "waitlist.join",
    entity_type: "session",
    entity_id: body.session_id,
    after: { customer_name: body.customer_name, kid_name: body.kid_name ?? null, email: body.email.toLowerCase() },
  });

  // Confirmation email to the person who joined (explicitly NOT a booking).
  // Best-effort — the row is already saved, and sendEmail logs the attempt to
  // email_log. No admin email on purpose: the dashboard shows waitlist rows.
  const info = await describeSession(sb, body.session_id);
  const when = info ? `${waitlistFmtDay(info.starts_at)} · ${waitlistFmtTime(info.starts_at)}` : body.session_id;
  const title = info?.programTitle ?? "Unknown program";
  const firstName = body.customer_name.trim().split(" ")[0];
  const forPlayer = body.kid_name ? ` for ${body.kid_name.trim().split(" ")[0]}` : "";

  try {
    await sendEmail({
      to: body.email.toLowerCase(),
      subject: `You're on the waitlist: ${title}`,
      template: "waitlist_joined_user",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7E57C2; margin-bottom: 8px;">You're on the waitlist.</h2>
          <p>Hi ${firstName},</p>
          <p>You've joined the waitlist${forPlayer} for this sold-out session:</p>
          <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">
            <strong>${title}</strong><br>${when}${info ? `<br>${info.venueName}` : ""}
          </p>
          <p><strong>This is not a booking</strong> — no spot is reserved and no payment has been taken.</p>
          <p>If a spot opens up, we'll email you with a booking link. We email everyone on the
          waitlist at the same time and spots are first-come, first-served — so book quickly
          when that email arrives.</p>
          <p>See you on court!<br>Obsidian Volleyball Academy</p>
        </div>
      `,
      text: `Hi ${firstName},\n\nYou've joined the waitlist${forPlayer} for this sold-out session:\n\n${title}\n${when}${info ? `\n${info.venueName}` : ""}\n\nThis is not a booking — no spot is reserved and no payment has been taken.\n\nIf a spot opens up, we'll email you with a booking link. We email everyone on the waitlist at the same time and spots are first-come, first-served — so book quickly when that email arrives.\n\nSee you on court!\nObsidian Volleyball Academy`,
    });
  } catch (err) {
    console.error("waitlist user confirmation failed", err);
  }

  return NextResponse.json({ ok: true });
}
