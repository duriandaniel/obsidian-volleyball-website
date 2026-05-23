import { supabaseAdmin } from "@/lib/supabase/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  capacity_override: number | null;
  program_title: string;
  program_type: string;
  default_capacity: number;
  venue_name: string;
  booked: number;
};

async function loadUpcoming(): Promise<SessionRow[]> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, status, capacity_override, program_id")
    .gte("starts_at", now)
    .is("deleted_at", null)
    .order("starts_at")
    .limit(60);

  if (!sessions || sessions.length === 0) return [];

  const programIds = Array.from(new Set(sessions.map((s) => s.program_id)));
  const { data: programs } = await sb
    .from("programs")
    .select("id, title, type, venue_id, default_capacity")
    .in("id", programIds);
  const programById = new Map((programs ?? []).map((p) => [p.id, p]));

  const venueIds = Array.from(new Set((programs ?? []).map((p) => p.venue_id)));
  const { data: venues } = await sb.from("venues").select("id, name").in("id", venueIds);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));

  const sessionIds = sessions.map((s) => s.id);
  const { data: bookings } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", sessionIds)
    .in("status", ["confirmed", "pending", "attended"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of bookings ?? []) counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);

  return sessions.map((s) => {
    const p = programById.get(s.program_id);
    return {
      id: s.id,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      status: s.status,
      capacity_override: s.capacity_override,
      program_title: p?.title ?? "(unknown)",
      program_type: p?.type ?? "",
      default_capacity: p?.default_capacity ?? 0,
      venue_name: p ? venueById.get(p.venue_id) ?? "" : "",
      booked: counts.get(s.id) ?? 0,
    };
  });
}

export default async function AdminCalendarPage() {
  const sessions = await loadUpcoming();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Calendar</div>
        <h1 className="font-heading text-3xl">Upcoming sessions</h1>
      </div>

      {sessions.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
          No upcoming sessions. <Link href="/admin/programs" className="text-[#9B4FDE]">Create a program</Link> to start.
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 font-normal">Date</th>
                <th className="text-left px-5 py-3 font-normal">Time</th>
                <th className="text-left px-5 py-3 font-normal">Program</th>
                <th className="text-left px-5 py-3 font-normal">Venue</th>
                <th className="text-right px-5 py-3 font-normal">Capacity</th>
                <th className="text-left px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const capacity = s.capacity_override ?? s.default_capacity;
                const pct = capacity > 0 ? (s.booked / capacity) * 100 : 0;
                const date = new Date(s.starts_at).toLocaleDateString("en-AU", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: "Australia/Sydney",
                });
                const start = new Date(s.starts_at).toLocaleTimeString("en-AU", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Australia/Sydney",
                });
                const end = new Date(s.ends_at).toLocaleTimeString("en-AU", {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: "Australia/Sydney",
                });
                return (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">{date}</td>
                    <td className="px-5 py-3 text-gray-400">{start}–{end}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-500 mr-2">{s.program_type}</span>
                      {s.program_title}
                    </td>
                    <td className="px-5 py-3 text-gray-400">{s.venue_name}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xs text-gray-400">{s.booked}/{capacity}</span>
                        <div className="w-16 h-1.5 bg-white/10 rounded overflow-hidden">
                          <div
                            className={`h-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-yellow-500" : "bg-[#9B4FDE]"}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {s.status === "cancelled" ? (
                        <span className="text-xs text-red-400">cancelled</span>
                      ) : (
                        <span className="text-xs text-gray-400">scheduled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
