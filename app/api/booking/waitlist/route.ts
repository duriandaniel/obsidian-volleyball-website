import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { addToWaitlist, describeSession, escHtml, waitlistFmtDay, waitlistFmtTime } from "@/lib/booking/waitlist";

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

  // Session must exist, be scheduled, and not yet be finished (matches the
  // booking window — a class is still joinable until it ends).
  const { data: session } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, status, capacity_override, program:programs(id, type, default_capacity), bookings(id, status)")
    .eq("id", body.session_id)
    .is("deleted_at", null)
    .is("bookings.deleted_at", null)
    .maybeSingle();
  if (!session || session.status !== "scheduled") {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if ((session.ends_at ?? session.starts_at) <= new Date().toISOString()) {
    return NextResponse.json({ error: "This session has already ended" }, { status: 400 });
  }

  // Only sold-out sessions accept waitlist joins — same capacity coalesce as
  // the DB trigger. Blocks abuse (flooding the table / a victim's inbox via
  // this public endpoint) on everything except genuinely full sessions, and
  // catches stale UI where a spot freed up since the page rendered.
  const program = Array.isArray(session.program) ? session.program[0] : session.program;
  const capacity = session.capacity_override ?? program?.default_capacity ?? null;
  // Same statuses every booking surface counts as taking a spot — a stricter
  // count here 409'd waitlist joins for sessions the UI correctly showed as
  // sold out (e.g. spots held by pending payments).
  const taken = (session.bookings ?? []).filter((b: { status: string }) =>
    ["confirmed", "pending", "attended"].includes(b.status)
  ).length;
  if (capacity == null || taken < capacity) {
    return NextResponse.json(
      { error: "Good news — this session has spots available. Book it instead of joining the waitlist." },
      { status: 409 }
    );
  }

  // A term waitlist means "any spot for the rest of the term", not just the
  // next class — one row per remaining session, so the family stays
  // notifiable after this week's class has passed.
  let sessionIds = [body.session_id];
  if (program?.type === "term") {
    const { data: future } = await sb
      .from("sessions")
      .select("id")
      .eq("program_id", program.id)
      .eq("status", "scheduled")
      .is("deleted_at", null)
      .gt("starts_at", new Date().toISOString());
    if (future?.length) sessionIds = future.map((s) => s.id);
  }

  let added: boolean;
  try {
    added = await addToWaitlist(sb, {
      sessionIds,
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
          <p>Hi ${escHtml(firstName)},</p>
          <p>You've joined the waitlist${escHtml(forPlayer)} for this sold-out session:</p>
          <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">
            <strong>${title}</strong><br>${when}${info ? `<br>${info.venueName}` : ""}
          </p>
          <p><strong>This is not a booking</strong> — no spot is reserved and no payment has been taken.</p>
          <p>If a spot opens up, the next five families on the waitlist are emailed a booking
          link at the same time. Spots are first-come, first-served — so book quickly when
          that email arrives.</p>
          <p>See you on court!<br>Obsidian Volleyball Academy</p>
        </div>
      `,
      text: `Hi ${firstName},\n\nYou've joined the waitlist${forPlayer} for this sold-out session:\n\n${title}\n${when}${info ? `\n${info.venueName}` : ""}\n\nThis is not a booking — no spot is reserved and no payment has been taken.\n\nIf a spot opens up, the next five families on the waitlist are emailed a booking link at the same time. Spots are first-come, first-served — so book quickly when that email arrives.\n\nSee you on court!\nObsidian Volleyball Academy`,
    });
  } catch (err) {
    console.error("waitlist user confirmation failed", err);
  }

  return NextResponse.json({ ok: true });
}
