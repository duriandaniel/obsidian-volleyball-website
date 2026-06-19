import type { Metadata } from "next";
import Link from "next/link";
import { loadTermPrograms, weekday, timeRange, type TermProgram } from "@/lib/booking/load";
import { formatSpotsLeft } from "@/lib/booking/pricing";

export const metadata: Metadata = {
  title: "Weekly Training | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const revalidate = 30; // ISR: cached + prefetchable; capacity re-checked at checkout (DB trigger)

// Same colourful, mobile-friendly format as the weekly-training timetable.
const LEVEL_COLOR: Record<string, string> = {
  Beginner: "text-green-400 border-green-400/40",
  Intermediate: "text-yellow-400 border-yellow-400/40",
  Advanced: "text-red-400 border-red-400/40",
};
const DAY_ORDER: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};

function displayLevel(p: TermProgram): string {
  const sl = (p.skill_level ?? "").toLowerCase();
  if (sl === "beginner" || sl === "intermediate" || sl === "advanced") {
    return sl.charAt(0).toUpperCase() + sl.slice(1);
  }
  const t = (p.title ?? "").toLowerCase();
  if (t.includes("beginner")) return "Beginner";
  if (t.includes("advanced")) return "Advanced";
  if (t.includes("intermediate")) return "Intermediate";
  return "All levels";
}
function levelClass(level: string): string {
  return LEVEL_COLOR[level] ?? "text-gray-300 border-white/20";
}
function shortVenue(name: string): string {
  return name.replace(/^Obsidian Volleyball Academy\s*/i, "").trim() || name;
}
function termLabel(season: string | null): string | null {
  const m = (season ?? "").match(/Term\s*\d+/i);
  return m ? m[0].replace(/\s+/g, " ") : null;
}
function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default async function JuniorClassesPage() {
  const all = (await loadTermPrograms())
    .filter((p) => !p.is_adult && p.weeks_remaining > 0)
    .sort((a, b) => {
      const da = a.first_session_at ? DAY_ORDER[weekday(a.first_session_at)] ?? 99 : 99;
      const db = b.first_session_at ? DAY_ORDER[weekday(b.first_session_at)] ?? 99 : 99;
      if (da !== db) return da - db;
      return (a.first_session_at ?? "").localeCompare(b.first_session_at ?? "");
    });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/booking" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mt-4 mb-2">Pick a class</h1>
        <p className="text-sm text-gray-400 mb-8 max-w-lg">
          Choose the class to enrol in. Players are grouped by ability, not age. Ages 8 to 18.
        </p>

        {all.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
            No weekly classes are open right now. Follow{" "}
            <a href="https://instagram.com/obsidianvolleyball" className="text-[#7E57C2]">@obsidianvolleyball</a>.
          </div>
        ) : (
          <>
            {/* Desktop / tablet: table */}
            <div className="hidden sm:block overflow-hidden border border-white/[0.08]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.04] text-gray-400 font-heading text-xs tracking-[0.2em] uppercase">
                    <th className="px-5 py-4 font-normal">Day</th>
                    <th className="px-5 py-4 font-normal">Time</th>
                    <th className="px-5 py-4 font-normal">Location</th>
                    <th className="px-5 py-4 font-normal">Level</th>
                    <th className="px-5 py-4 font-normal text-right">Enrol</th>
                  </tr>
                </thead>
                <tbody>
                  {all.map((p) => {
                    const level = displayLevel(p);
                    const soldOut = p.booked >= p.capacity;
                    return (
                      <tr key={p.id} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-5">
                          <span className="block text-white font-heading tracking-wide uppercase">
                            {p.first_session_at ? weekday(p.first_session_at) : "TBA"}
                          </span>
                          {termLabel(p.season) && (
                            <span className="block text-gray-500 text-[11px] tracking-wide mt-0.5">{termLabel(p.season)}</span>
                          )}
                        </td>
                        <td className="px-5 py-5 text-gray-300 text-sm whitespace-nowrap">
                          {p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : "TBA"}
                        </td>
                        <td className="px-5 py-5">
                          <span className="inline-flex items-center gap-1.5 text-white font-heading tracking-wide whitespace-nowrap">
                            <PinIcon />
                            {shortVenue(p.venue_name)}
                          </span>
                        </td>
                        <td className="px-5 py-5">
                          <span className={`inline-block border ${levelClass(level)} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                            {level}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-right whitespace-nowrap">
                          {soldOut ? (
                            <span className="text-sm text-gray-500">Sold out</span>
                          ) : (
                            <div className="flex flex-col items-end gap-1">
                              <Link
                                href={`/booking/term/${p.slug}`}
                                className="inline-block text-center bg-[#5E35A8] text-white font-heading text-sm px-5 py-2.5 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide"
                              >
                                SELECT
                              </Link>
                              <span className="text-xs text-gray-500">{formatSpotsLeft(p.capacity - p.booked)}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards */}
            <div className="sm:hidden space-y-3">
              {all.map((p) => {
                const level = displayLevel(p);
                const soldOut = p.booked >= p.capacity;
                return (
                  <div key={p.id} className="border border-white/[0.08] p-4 bg-[#111]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-heading text-lg tracking-wide uppercase">
                        {p.first_session_at ? weekday(p.first_session_at) : "TBA"}
                        {termLabel(p.season) && (
                          <span className="ml-2 text-gray-500 text-[11px] font-sans tracking-wide normal-case">{termLabel(p.season)}</span>
                        )}
                      </span>
                      <span className={`inline-block border ${levelClass(level)} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                        {level}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-1">
                      {p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : "TBA"}
                    </p>
                    <p className="flex items-center gap-1.5 text-white font-heading tracking-wide text-sm mb-4">
                      <PinIcon />
                      {shortVenue(p.venue_name)}
                    </p>
                    {soldOut ? (
                      <span className="text-sm text-gray-500">Sold out</span>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-gray-500">{formatSpotsLeft(p.capacity - p.booked)}</span>
                        <Link
                          href={`/booking/term/${p.slug}`}
                          className="inline-block text-center bg-[#5E35A8] text-white font-heading text-sm px-6 py-2 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide"
                        >
                          SELECT
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
