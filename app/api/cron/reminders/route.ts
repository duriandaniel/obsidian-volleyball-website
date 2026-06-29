import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

// Daily Vercel cron. Sends 24h-before reminder emails to anyone with a
// confirmed booking starting in the next 24-36h window. Idempotent: checks
// email_log to avoid double-sending.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // Reminder emails are disabled. The daily cron is removed from vercel.json,
  // and this flag also neutralizes the manual ?secret= path so nothing can be
  // sent. Set REMINDERS_ENABLED=true to turn them back on. Confirmation emails
  // are unaffected.
  if (process.env.REMINDERS_ENABLED !== "true") {
    return NextResponse.json({ ok: true, disabled: true, sent: 0 });
  }

  // Vercel cron requests come with a special header. In dev / preview, allow
  // a manual ?secret= invocation for testing.
  const isCron = req.headers.get("user-agent")?.includes("vercel") || req.headers.get("x-vercel-cron") === "1";
  const allowOverride = req.nextUrl.searchParams.get("secret") === process.env.SUPABASE_SECRET_KEY?.slice(-12);
  if (!isCron && !allowOverride) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sb = supabaseAdmin();

  // Window: now+24h to now+36h (so the daily run picks up everything starting
  // tomorrow morning Sydney time regardless of when the cron actually fires)
  const now = Date.now();
  const windowStart = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + 36 * 60 * 60 * 1000).toISOString();

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, program_id")
    .eq("status", "scheduled")
    .gte("starts_at", windowStart)
    .lt("starts_at", windowEnd)
    .is("deleted_at", null);

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ ok: true, window: { windowStart, windowEnd }, sessions: 0, sent: 0 });
  }

  const sessionIds = sessions.map((s) => s.id);
  const programIds = Array.from(new Set(sessions.map((s) => s.program_id)));

  const [{ data: bookings }, { data: programs }] = await Promise.all([
    sb
      .from("bookings")
      .select("id, session_id, customer_id, participant_id")
      .in("session_id", sessionIds)
      .in("status", ["confirmed", "pending"])
      .is("deleted_at", null),
    sb.from("programs").select("id, title, venue_id").in("id", programIds),
  ]);

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, sessions: sessions.length, bookings: 0, sent: 0 });
  }

  const programById = new Map((programs ?? []).map((p) => [p.id, p]));
  const venueIds = Array.from(new Set((programs ?? []).map((p) => p.venue_id)));
  const { data: venues } = await sb.from("venues").select("id, name, address").in("id", venueIds);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v]));

  const customerIds = Array.from(new Set(bookings.map((b) => b.customer_id)));
  const participantIds = Array.from(new Set(bookings.map((b) => b.participant_id)));
  const [{ data: customers }, { data: participants }] = await Promise.all([
    sb.from("customers").select("id, email, first_name").in("id", customerIds),
    sb.from("participants").select("id, first_name").in("id", participantIds),
  ]);
  const custById = new Map((customers ?? []).map((c) => [c.id, c]));
  const partById = new Map((participants ?? []).map((p) => [p.id, p]));

  // Idempotency: skip bookings that already have a session_reminder_24h email
  const { data: priorReminders } = await sb
    .from("email_log")
    .select("related_booking_id")
    .in("related_booking_id", bookings.map((b) => b.id))
    .eq("template", "session_reminder_24h")
    .eq("status", "sent");
  const alreadyReminded = new Set((priorReminders ?? []).map((r) => r.related_booking_id));

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";
  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const b of bookings) {
    if (alreadyReminded.has(b.id)) {
      skipped++;
      continue;
    }
    const cust = custById.get(b.customer_id);
    if (!cust?.email) {
      skipped++;
      continue;
    }
    const part = partById.get(b.participant_id);
    const sess = sessionById.get(b.session_id);
    if (!sess) continue;
    const program = programById.get(sess.program_id);
    const venue = program ? venueById.get(program.venue_id) : null;

    const dateStr = new Date(sess.starts_at).toLocaleDateString("en-AU", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Australia/Sydney",
    });
    const startStr = new Date(sess.starts_at).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Australia/Sydney",
    });
    const endStr = new Date(sess.ends_at).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Australia/Sydney",
    });
    const venueDisplay = venue ? (venue.address ? `${venue.name}, ${venue.address}` : venue.name) : "Venue TBA";

    try {
      await sendEmail({
        to: cust.email,
        subject: `Reminder: ${part?.first_name ?? "your child"}'s session tomorrow`,
        template: "session_reminder_24h",
        relatedBookingId: b.id,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #7E57C2;">See you tomorrow.</h2>
            <p>Hi${cust.first_name ? " " + cust.first_name : ""},</p>
            <p>Just a reminder that ${part?.first_name ? part.first_name + " is" : "your child is"} booked in for ${program?.title ?? "an Obsidian session"} tomorrow.</p>
            <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">
              <strong>${dateStr}</strong><br>
              ${startStr} – ${endStr}<br>
              ${venueDisplay}
            </p>
            <p>Wear suitable indoor court shoes. We provide all volleyball gear.</p>
            <p style="font-size: 12px; color: #666;">
              Can't make it? Just reply to this email and we'll help.
            </p>
            <p>See you on court!<br>Obsidian Volleyball Academy</p>
          </div>
        `,
        text: `Reminder: ${part?.first_name ?? "your child"}'s session tomorrow.\n\n${dateStr} · ${startStr}–${endStr}\n${venueDisplay}\n\nWear suitable indoor court shoes.\n\nCan't make it? Just reply to this email and we'll help.\n\nObsidian Volleyball Academy`,
      });
      sent++;
    } catch (err) {
      failed++;
      console.error("reminder send failed", cust.email, err);
    }
  }

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "cron.reminders_24h",
    entity_type: "cron",
    after: { sessions: sessions.length, bookings: bookings.length, sent, skipped, failed, windowStart, windowEnd },
  });

  return NextResponse.json({ ok: true, sessions: sessions.length, bookings: bookings.length, sent, skipped, failed });
}
