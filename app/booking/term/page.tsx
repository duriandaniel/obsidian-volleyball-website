import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatCents, formatSpotsLeft } from "@/lib/booking/pricing";

export const metadata: Metadata = {
  title: "Term Programs | Obsidian Volleyball Academy",
  description: "Weekly volleyball term programs.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type TermProgramView = {
  id: string;
  slug: string;
  title: string;
  season: string | null;
  description: string | null;
  skill_level: string | null;
  venue_name: string;
  per_week_cents: number;
  weeks_remaining: number;
  next_session_at: string | null;
  capacity: number;
  booked: number;
};

async function loadTermPrograms(): Promise<TermProgramView[]> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return [];
  }
  const now = new Date().toISOString();

  const { data: programs } = await sb
    .from("programs")
    .select("id, slug, title, season, description, skill_level, default_capacity, venue_id, pricing_rule_id")
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null);
  if (!programs || programs.length === 0) return [];

  const venueIds = Array.from(new Set(programs.map((p) => p.venue_id)));
  const ruleIds = Array.from(new Set(programs.map((p) => p.pricing_rule_id).filter(Boolean)));

  const [{ data: venues }, { data: rules }, { data: sessions }] = await Promise.all([
    sb.from("venues").select("id, name").in("id", venueIds),
    sb.from("pricing_rules").select("id, term_per_session_cents").in("id", ruleIds),
    sb
      .from("sessions")
      .select("id, program_id, starts_at")
      .in("program_id", programs.map((p) => p.id))
      .eq("status", "scheduled")
      .gte("starts_at", now)
      .is("deleted_at", null)
      .order("starts_at"),
  ]);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));
  const ruleById = new Map((rules ?? []).map((r) => [r.id, r.term_per_session_cents ?? 0]));

  // Booking counts (sum over remaining sessions of any one program)
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: bookings } = sessionIds.length
    ? await sb
        .from("bookings")
        .select("session_id")
        .in("session_id", sessionIds)
        .in("status", ["confirmed", "pending", "attended"])
        .is("deleted_at", null)
    : { data: [] as { session_id: string }[] };
  const bookingsBySession = new Map<string, number>();
  for (const b of bookings ?? []) {
    bookingsBySession.set(b.session_id, (bookingsBySession.get(b.session_id) ?? 0) + 1);
  }

  return programs.map((p): TermProgramView => {
    const programSessions = (sessions ?? []).filter((s) => s.program_id === p.id);
    const perWeek = ruleById.get(p.pricing_rule_id ?? "") ?? 0;
    const earliestSession = programSessions[0]?.id;
    const earliestBookings = earliestSession ? bookingsBySession.get(earliestSession) ?? 0 : 0;
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      season: p.season,
      description: p.description,
      skill_level: p.skill_level,
      venue_name: venueById.get(p.venue_id) ?? "Venue TBA",
      per_week_cents: perWeek,
      weeks_remaining: programSessions.length,
      next_session_at: programSessions[0]?.starts_at ?? null,
      capacity: p.default_capacity,
      booked: earliestBookings,
    };
  });
}

export default async function TermBrowsePage() {
  const programs = await loadTermPrograms();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">TERM PROGRAMS</p>
        <h1 className="font-heading text-4xl mb-3">Weekly classes</h1>
        <p className="text-gray-400 mb-10 max-w-2xl">
          Term programs run weekly through the school term. Enrol for the whole term, or join mid-term at a pro-rata price.
        </p>

        {programs.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
            No term programs are open for enrolment right now. Check back soon or follow{" "}
            <a href="https://instagram.com/obsidianvolleyball" className="text-[#9B4FDE]">@obsidianvolleyball</a>.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((p) => (
              <TermCard key={p.id} program={p} />
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-500">
          <Link href="/booking" className="text-[#9B4FDE] hover:text-white">← Other booking options</Link>
        </div>
      </div>
    </div>
  );
}

function TermCard({ program }: { program: TermProgramView }) {
  const total = program.per_week_cents * program.weeks_remaining;
  const nextSession = program.next_session_at
    ? new Date(program.next_session_at).toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "short",
        timeZone: "Australia/Sydney",
      })
    : null;
  const time = program.next_session_at
    ? new Date(program.next_session_at).toLocaleTimeString("en-AU", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Australia/Sydney",
      })
    : null;
  const soldOut = program.booked >= program.capacity;

  return (
    <Link
      href={`/booking/term/${program.slug}`}
      className={`block border rounded-lg p-6 transition-colors ${
        soldOut ? "border-white/5 opacity-60 pointer-events-none" : "border-white/10 hover:border-[#9B4FDE]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">{program.season ?? "Term"}</div>
          <h2 className="font-heading text-xl">{program.title}</h2>
          <div className="text-sm text-gray-400 mt-1">{program.venue_name}</div>
        </div>
        {program.skill_level && (
          <span className="text-xs text-gray-400 uppercase tracking-wider">{program.skill_level}</span>
        )}
      </div>
      {nextSession && (
        <div className="text-sm text-gray-300 mt-3">
          First session: {nextSession} at {time}
        </div>
      )}
      <div className="flex items-end justify-between pt-4 mt-4 border-t border-white/5">
        <div>
          <div className="text-xs text-gray-500">{program.weeks_remaining} week{program.weeks_remaining === 1 ? "" : "s"} remaining</div>
          <div className="font-heading text-2xl mt-1 text-[#9B4FDE]">{formatCents(total)}</div>
          <div className="text-xs text-gray-500">{formatCents(program.per_week_cents)}/week</div>
        </div>
        <div className="text-xs text-gray-400">
          {formatSpotsLeft(program.capacity - program.booked)}
        </div>
      </div>
    </Link>
  );
}
