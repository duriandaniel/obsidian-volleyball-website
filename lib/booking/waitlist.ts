// Server-side waitlist helpers, shared by the join API route and the Stripe
// webhook. The waitlist table is generic across session types (camp, term,
// trial, adult) — a row is "active" while deleted_at and converted_booking_id
// are both null.

import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { isAdultProgram } from "@/lib/booking/audience";

type Sb = ReturnType<typeof supabaseAdmin>;

// How many people hear about each freed spot. Several are emailed at once on
// purpose — first-come first-served maximises the chance the spot refills.
export const WAITLIST_NOTIFY_LIMIT = 5;

export const OWNER_EMAIL = "obsidianvolleyball@gmail.com";

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });

type SessionInfo = {
  id: string;
  starts_at: string;
  ends_at: string;
  programTitle: string;
  programType: "camp" | "term";
  venueName: string;
  bookUrl: string;
};

// Session + program + venue context for waitlist emails, keyed by session id.
async function loadSessionInfo(sb: Sb, sessionIds: string[]): Promise<Map<string, SessionInfo>> {
  const out = new Map<string, SessionInfo>();
  if (sessionIds.length === 0) return out;

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, program_id")
    .in("id", sessionIds)
    .is("deleted_at", null);
  if (!sessions?.length) return out;

  const programIds = Array.from(new Set(sessions.map((s) => s.program_id)));
  const { data: programs } = await sb
    .from("programs")
    .select("id, title, slug, type, age_min, venue_id")
    .in("id", programIds);
  const programById = new Map((programs ?? []).map((p) => [p.id, p]));

  const venueIds = Array.from(new Set((programs ?? []).map((p) => p.venue_id).filter(Boolean)));
  const { data: venues } = venueIds.length
    ? await sb.from("venues").select("id, name").in("id", venueIds)
    : { data: [] };
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));

  for (const s of sessions) {
    const p = programById.get(s.program_id);
    if (!p) continue;
    const bookUrl =
      p.type === "camp"
        ? `${APP_URL()}/booking/camps`
        : isAdultProgram(p)
        ? `${APP_URL()}/booking/adult`
        : `${APP_URL()}/booking/term/${p.slug}`;
    out.set(s.id, {
      id: s.id,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      programTitle: p.title,
      programType: p.type,
      venueName: venueById.get(p.venue_id) ?? "Venue TBA",
      bookUrl,
    });
  }
  return out;
}

// Add someone to the waitlist for one or more sessions. Idempotent: an active
// row per (session, email) is kept, duplicates are ignored.
// Returns true if at least one new row was created.
export async function addToWaitlist(
  sb: Sb,
  args: { sessionIds: string[]; customerName: string; kidName?: string | null; email: string; phone?: string | null }
): Promise<boolean> {
  const email = args.email.toLowerCase();
  let added = false;
  for (const sessionId of args.sessionIds) {
    const { error } = await sb.from("waitlist").insert({
      session_id: sessionId,
      customer_name: args.customerName,
      kid_name: args.kidName || null,
      email,
      phone: args.phone || null,
    });
    // 23505 = unique_violation: already actively waitlisted for this session.
    if (!error) added = true;
    else if (error.code !== "23505") throw error;
  }
  return added;
}

// True if this email already has an active waitlist row on any of the sessions.
export async function isOnWaitlist(sb: Sb, email: string, sessionIds: string[]): Promise<boolean> {
  if (sessionIds.length === 0) return false;
  const { count } = await sb
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .in("session_id", sessionIds)
    .eq("email", email.toLowerCase())
    .is("deleted_at", null)
    .is("converted_booking_id", null);
  return (count ?? 0) > 0;
}

// A spot opened up (admin cancelled a booking, with or without a refund):
// email the top N active waitlist rows per session, oldest first, and stamp
// notified_at. People can be re-notified on later openings — spots are
// strictly first-come first-served.
//
// NOT called automatically — the admin is prompted in the dashboard and this
// runs via POST /api/waitlist/notify. Returns a per-session summary for the
// dashboard to display. Best-effort: one bad email must not block the rest.
export async function notifyWaitlistOpenings(
  sb: Sb,
  sessionIds: string[],
  reason: string
): Promise<{ session_id: string; program: string; starts_at: string; notified: number }[]> {
  const summary: { session_id: string; program: string; starts_at: string; notified: number }[] = [];
  const infoById = await loadSessionInfo(sb, Array.from(new Set(sessionIds)));
  const nowIso = new Date().toISOString();
  // Only sessions still in the future are worth queueing for.
  const openings = Array.from(infoById.values()).filter((s) => s.starts_at > nowIso);
  if (openings.length === 0) return summary;

  const notifiedEmails = new Set<string>(); // one email per person per event, even across sessions
  for (const s of openings) {
    const { data: rows } = await sb
      .from("waitlist")
      .select("id, customer_name, kid_name, email")
      .eq("session_id", s.id)
      .is("deleted_at", null)
      .is("converted_booking_id", null)
      .order("created_at", { ascending: true })
      .limit(WAITLIST_NOTIFY_LIMIT);
    if (!rows?.length) {
      summary.push({ session_id: s.id, program: s.programTitle, starts_at: s.starts_at, notified: 0 });
      continue;
    }

    const when = `${fmtDay(s.starts_at)} · ${fmtTime(s.starts_at)} – ${fmtTime(s.ends_at)}`;
    const notifiedIds: string[] = [];

    for (const row of rows) {
      notifiedIds.push(row.id);
      if (notifiedEmails.has(row.email)) continue;
      notifiedEmails.add(row.email);
      const firstName = row.customer_name.split(" ")[0];
      const forKid = row.kid_name ? ` for ${row.kid_name.split(" ")[0]}` : "";
      try {
        await sendEmail({
          to: row.email,
          subject: `A spot just opened up: ${s.programTitle}`,
          template: "waitlist_spot_open",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
              <h2 style="color: #7E57C2; margin-bottom: 8px;">A spot just opened up.</h2>
              <p>Hi ${firstName},</p>
              <p>Good news — a spot${forKid} has just opened up in a session you're waitlisted for:</p>
              <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">
                <strong>${s.programTitle}</strong><br>${when}<br>${s.venueName}
              </p>
              <p><a href="${s.bookUrl}" style="display:inline-block;background:#7E57C2;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;">Book the spot</a></p>
              <p style="font-size: 13px; color: #666;">We email everyone on the waitlist at the same time and spots are first-come, first-served — so book quickly. If it's gone by the time you get there, you'll stay on the waitlist for the next opening.</p>
              <p>See you on court!<br>Obsidian Volleyball Academy</p>
            </div>
          `,
          text: `A spot just opened up${forKid}.\n\n${s.programTitle}\n${when}\n${s.venueName}\n\nBook it here: ${s.bookUrl}\n\nWe email everyone on the waitlist at the same time and spots are first-come, first-served — so book quickly. If it's gone, you'll stay on the waitlist for the next opening.\n\nObsidian Volleyball Academy`,
        });
      } catch (err) {
        // sendEmail already logged the failure to email_log; keep going.
        console.error("waitlist notify failed", { email: row.email, sessionId: s.id, err });
      }
    }

    if (notifiedIds.length) {
      await sb.from("waitlist").update({ notified_at: nowIso }).in("id", notifiedIds);
      await sb.from("audit_log").insert({
        actor_role: "system",
        action: "waitlist.notified",
        entity_type: "session",
        entity_id: s.id,
        after: { reason, notified: notifiedIds.length, program: s.programTitle, starts_at: s.starts_at },
      });
    }
    summary.push({ session_id: s.id, program: s.programTitle, starts_at: s.starts_at, notified: notifiedIds.length });
  }
  return summary;
}

// After a successful booking, mark any matching active waitlist rows converted
// so they stop being notified. Matched by (session, payer email). Best-effort.
export async function markWaitlistConverted(
  sb: Sb,
  email: string,
  bookings: { id: string; session_id: string }[]
): Promise<void> {
  try {
    for (const b of bookings) {
      await sb
        .from("waitlist")
        .update({ converted_booking_id: b.id })
        .eq("session_id", b.session_id)
        .eq("email", email.toLowerCase())
        .is("deleted_at", null)
        .is("converted_booking_id", null);
    }
  } catch (err) {
    console.warn("waitlist conversion mark skipped:", err instanceof Error ? err.message : err);
  }
}

// Session context for the join-notification email to the owner.
export async function describeSession(sb: Sb, sessionId: string): Promise<SessionInfo | null> {
  const info = await loadSessionInfo(sb, [sessionId]);
  return info.get(sessionId) ?? null;
}

export { fmtDay as waitlistFmtDay, fmtTime as waitlistFmtTime };
