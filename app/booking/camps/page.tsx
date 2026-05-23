import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CampCart } from "./CampCart";

export const metadata: Metadata = {
  title: "Holiday Camp Booking | Obsidian Volleyball Academy",
  description: "Pick your camp days.",
  robots: { index: false, follow: false },
};

export type CampSessionView = {
  id: string;
  starts_at: string;
  ends_at: string;
  program_id: string;
  capacity_override: number | null;
  status: string;
  booked: number;
  programs: {
    id: string;
    title: string;
    season: string | null;
    default_capacity: number;
    skill_level: string | null;
    venues: { name: string };
  };
};

async function loadCampSessions(): Promise<CampSessionView[]> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  // First, find published camp programs
  const { data: programs, error: pErr } = await sb
    .from("programs")
    .select("id, title, season, default_capacity, skill_level, type, venue_id")
    .eq("type", "camp")
    .eq("status", "published")
    .is("deleted_at", null);
  if (pErr || !programs || programs.length === 0) return [];

  const programIds = programs.map((p) => p.id);
  const venueIds = Array.from(new Set(programs.map((p) => p.venue_id)));

  const { data: venues } = await sb.from("venues").select("id, name").in("id", venueIds);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));
  const programById = new Map(programs.map((p) => [p.id, p]));

  const { data: sessions, error: sErr } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, program_id, capacity_override, status")
    .in("program_id", programIds)
    .eq("status", "scheduled")
    .gte("starts_at", now)
    .is("deleted_at", null)
    .order("starts_at", { ascending: true });
  if (sErr || !sessions || sessions.length === 0) return [];

  // Booking counts per session
  const sessionIds = sessions.map((s) => s.id);
  const { data: bookings } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", sessionIds)
    .in("status", ["confirmed", "pending"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of bookings ?? []) {
    counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);
  }

  return sessions.map((s): CampSessionView => {
    const program = programById.get(s.program_id)!;
    return {
      id: s.id,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      program_id: s.program_id,
      capacity_override: s.capacity_override,
      status: s.status,
      booked: counts.get(s.id) ?? 0,
      programs: {
        id: program.id,
        title: program.title,
        season: program.season,
        default_capacity: program.default_capacity,
        skill_level: program.skill_level,
        venues: { name: venueById.get(program.venue_id) ?? "Venue TBA" },
      },
    };
  });
}

export default async function CampBookingPage() {
  const sessions = await loadCampSessions();

  if (sessions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">HOLIDAY CAMPS</p>
          <h1 className="font-heading text-4xl mb-6">No camps available right now</h1>
          <p className="text-gray-400">
            Check back soon, or follow{" "}
            <a
              href="https://instagram.com/obsidianvolleyball"
              className="text-[#9B4FDE] hover:text-white"
            >
              @obsidianvolleyball
            </a>{" "}
            for announcements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">HOLIDAY CAMPS</p>
        <h1 className="font-heading text-4xl mb-6">Pick your days</h1>
        <p className="text-gray-400 mb-8">
          Select the days you want. Bundle discounts apply automatically.
        </p>
        <CampCart sessions={sessions} />
      </div>
    </div>
  );
}
