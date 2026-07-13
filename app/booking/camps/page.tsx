import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAfternoonProgramSlug } from "@/lib/booking/pricing";
import { CampCart } from "./CampCart";

export const metadata: Metadata = {
  title: "Holiday Camp Booking | Obsidian Volleyball Academy",
  description: "Pick your camp days.",
  robots: { index: false, follow: false },
};

// Always render at request time so we read live capacity from the DB.
export const revalidate = 30; // ISR: cached + prefetchable; capacity re-checked at checkout (DB trigger)

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
    is_afternoon: boolean; // afternoon holiday class (1:30–3:30pm) vs morning camp
    venues: { name: string };
  };
};

async function loadCampSessions(): Promise<CampSessionView[]> {
  // Be tolerant during the bootstrap window: if env vars or schema aren't ready,
  // show the empty state instead of throwing a 500.
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return [];
  }
  const now = new Date().toISOString();

  // First, find published camp programs. On preview/staging deploys
  // (PREVIEW_DRAFT_PROGRAMS=1, set in Vercel's Preview env only) drafts are
  // shown too, so new programs can be reviewed before they go live on prod.
  const statuses = process.env.PREVIEW_DRAFT_PROGRAMS === "1" ? ["published", "draft"] : ["published"];
  const { data: programs, error: pErr } = await sb
    .from("programs")
    .select("id, title, slug, season, default_capacity, skill_level, type, venue_id")
    .eq("type", "camp")
    .in("status", statuses)
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
    // Bookable until the camp day ends, so a day in progress still shows.
    .gte("ends_at", now)
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
        is_afternoon: isAfternoonProgramSlug(program.slug),
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
          <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">HOLIDAY CAMPS</p>
          <h1 className="font-heading text-4xl mb-6">No camps available right now</h1>
          <p className="text-gray-400">
            Check back soon, or follow{" "}
            <a
              href="https://instagram.com/obsidianvolleyball"
              className="text-[#7E57C2] hover:text-white"
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
        <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">HOLIDAY CAMPS</p>
        <h1 className="font-heading text-4xl mb-6">Pick your days</h1>
        <div className="text-gray-400 mb-8">
          <p className="mb-3">Pick the days you want, the total updates automatically:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Camp day (9am–1pm): $70 · any 5 days $250 · each extra day $40</li>
            <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Half day (9–11am): $45</li>
            <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Afternoon class (1:30–3:30pm): $36 · all 5 afternoons $130</li>
          </ul>
        </div>
        <CampCart sessions={sessions} />
      </div>
    </div>
  );
}
