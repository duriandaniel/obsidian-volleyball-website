import { supabaseAdmin } from "@/lib/supabase/server";
import { AttendanceToggle } from "./AttendanceToggle";
import { BroadcastButton } from "./BroadcastButton";
import { AddBookingButton } from "./AddBookingButton";

export const dynamic = "force-dynamic";

type Roster = {
  session_id: string;
  starts_at: string;
  ends_at: string;
  program_title: string;
  venue_name: string;
  capacity: number;
  bookings: {
    booking_id: string;
    participant_name: string;
    parent_name: string;
    parent_phone: string | null;
    parent_email: string;
    skill_level: string | null;
    school: string | null;
    year_at_school: string | null;
    medical_notes: string | null;
    photo_consent: boolean;
    status: string;
    source: string;
  }[];
};

async function loadToday(): Promise<Roster[]> {
  const sb = supabaseAdmin();
  const now = new Date();
  // "Today" in Sydney terms
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const today = fmt.format(now); // YYYY-MM-DD in Sydney
  const startISO = new Date(`${today}T00:00:00+10:00`).toISOString();
  const endISO = new Date(`${today}T23:59:59+10:00`).toISOString();

  // Sessions today
  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, program_id, capacity_override, status")
    .gte("starts_at", startISO)
    .lte("starts_at", endISO)
    .eq("status", "scheduled")
    .is("deleted_at", null)
    .order("starts_at");

  if (!sessions || sessions.length === 0) return [];

  const programIds = Array.from(new Set(sessions.map((s) => s.program_id)));
  const { data: programs } = await sb
    .from("programs")
    .select("id, title, venue_id, default_capacity")
    .in("id", programIds);
  const programById = new Map((programs ?? []).map((p) => [p.id, p]));

  const venueIds = Array.from(new Set((programs ?? []).map((p) => p.venue_id)));
  const { data: venues } = await sb.from("venues").select("id, name").in("id", venueIds);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));

  const sessionIds = sessions.map((s) => s.id);
  const { data: bookings } = await sb
    .from("bookings")
    .select("id, session_id, status, source, participant_id, customer_id")
    .in("session_id", sessionIds)
    .in("status", ["confirmed", "attended", "no_show"])
    .is("deleted_at", null);

  const participantIds = Array.from(new Set((bookings ?? []).map((b) => b.participant_id)));
  const customerIds = Array.from(new Set((bookings ?? []).map((b) => b.customer_id)));

  const { data: participants } = await sb
    .from("participants")
    .select("id, first_name, last_name, school_name, year_at_school, volleyball_level, medical_notes")
    .in("id", participantIds);
  const partById = new Map((participants ?? []).map((p) => [p.id, p]));

  const { data: customers } = await sb
    .from("customers")
    .select("id, first_name, last_name, email, phone, photo_consent")
    .in("id", customerIds);
  const custById = new Map((customers ?? []).map((c) => [c.id, c]));

  return sessions.map((s) => {
    const prog = programById.get(s.program_id);
    const capacity = s.capacity_override ?? prog?.default_capacity ?? 24;
    const sessionBookings = (bookings ?? []).filter((b) => b.session_id === s.id);
    return {
      session_id: s.id,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      program_title: prog?.title ?? "(unknown)",
      venue_name: prog ? venueById.get(prog.venue_id) ?? "" : "",
      capacity,
      bookings: sessionBookings.map((b) => {
        const part = partById.get(b.participant_id);
        const cust = custById.get(b.customer_id);
        return {
          booking_id: b.id,
          participant_name: part ? `${part.first_name} ${part.last_name}`.trim() : "(unknown)",
          parent_name: cust ? `${cust.first_name ?? ""} ${cust.last_name ?? ""}`.trim() : "",
          parent_phone: cust?.phone ?? null,
          parent_email: cust?.email ?? "",
          skill_level: part?.volleyball_level ?? null,
          school: part?.school_name ?? null,
          year_at_school: part?.year_at_school ?? null,
          medical_notes: part?.medical_notes ?? null,
          photo_consent: cust?.photo_consent ?? false,
          status: b.status,
          source: b.source,
        };
      }),
    };
  });
}

export default async function AdminTodayPage() {
  const rosters = await loadToday();
  const nowStr = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Today</div>
        <h1 className="font-heading text-3xl">{nowStr}</h1>
      </div>

      {rosters.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
          No sessions scheduled for today.
        </div>
      ) : (
        <div className="space-y-6">
          {rosters.map((r) => (
            <RosterCard key={r.session_id} roster={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function RosterCard({ roster }: { roster: Roster }) {
  const start = new Date(roster.starts_at).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  });
  const end = new Date(roster.ends_at).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Australia/Sydney",
  });

  const confirmed = roster.bookings.filter((b) => b.status === "confirmed").length;
  const attended = roster.bookings.filter((b) => b.status === "attended").length;
  const noShow = roster.bookings.filter((b) => b.status === "no_show").length;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="bg-white/[0.02] border-b border-white/10 px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-heading text-xl">{roster.program_title}</div>
          <div className="text-sm text-gray-400">
            {start} – {end} · {roster.venue_name}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="px-3 py-1 rounded bg-[#9B4FDE]/15 text-[#9B4FDE]">
            {roster.bookings.length}/{roster.capacity} booked
          </span>
          <span className="px-3 py-1 rounded bg-green-500/15 text-green-400">
            {attended} attended
          </span>
          {noShow > 0 && <span className="px-3 py-1 rounded bg-red-500/15 text-red-400">{noShow} no-show</span>}
          {confirmed > 0 && <span className="px-3 py-1 rounded bg-white/10 text-gray-300">{confirmed} pending</span>}
          <AddBookingButton sessionId={roster.session_id} />
          <BroadcastButton sessionId={roster.session_id} rosterCount={roster.bookings.length} />
        </div>
      </div>

      {roster.bookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">No bookings for this session.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase tracking-wider">
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-2 font-normal">Child</th>
              <th className="text-left px-5 py-2 font-normal">Level</th>
              <th className="text-left px-5 py-2 font-normal">School / Yr</th>
              <th className="text-left px-5 py-2 font-normal">Parent</th>
              <th className="text-left px-5 py-2 font-normal">Phone</th>
              <th className="text-left px-5 py-2 font-normal">Flags</th>
              <th className="text-right px-5 py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.bookings.map((b) => (
              <tr key={b.booking_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-5 py-3">
                  <div className="font-medium">{b.participant_name}</div>
                </td>
                <td className="px-5 py-3">
                  {b.skill_level && (
                    <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                      b.skill_level === "beginner" ? "bg-green-500/15 text-green-400" :
                      b.skill_level === "intermediate" ? "bg-blue-500/15 text-blue-400" :
                      "bg-purple-500/15 text-purple-400"
                    }`}>
                      {b.skill_level}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {b.school ?? "—"} {b.year_at_school ? `· ${b.year_at_school}` : ""}
                </td>
                <td className="px-5 py-3 text-gray-300">{b.parent_name || "—"}</td>
                <td className="px-5 py-3 text-gray-400">
                  {b.parent_phone ? <a href={`tel:${b.parent_phone}`} className="text-[#9B4FDE]">{b.parent_phone}</a> : "—"}
                </td>
                <td className="px-5 py-3 text-xs">
                  {b.medical_notes && (
                    <span title={b.medical_notes} className="text-red-400 font-semibold cursor-help mr-2">MED</span>
                  )}
                  {!b.photo_consent && <span className="text-yellow-400 font-semibold">NO PHOTO</span>}
                </td>
                <td className="px-5 py-3 text-right">
                  <AttendanceToggle bookingId={b.booking_id} status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
