import TrackedBookingLink from "@/components/TrackedBookingLink";
import SectionReveal from "@/components/SectionReveal";
import { weekday, timeRange, type TermProgram } from "@/lib/booking/load";

// Flat, no-click view of every term session. Data comes straight from Supabase
// (loadTermPrograms) so Dan's DB edits flow through with no code change.

// Traffic-light levels: green / yellow / red.
const LEVEL_COLOR: Record<string, string> = {
  Beginner: "text-green-400 border-green-400/40",
  Intermediate: "text-yellow-400 border-yellow-400/40",
  Advanced: "text-red-400 border-red-400/40",
};

// Always present the class's designed level (Beginner / Intermediate / Advanced),
// never "Mixed". Prefer the program skill_level; fall back to the title.
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

// Timetable shows the short venue (suburb), e.g. "West Ryde", not the full
// "Obsidian Volleyball Academy West Ryde".
function shortVenue(name: string): string {
  return name.replace(/^Obsidian Volleyball Academy\s*/i, "").trim() || name;
}

// "Term 2 2026" -> "Term 2" (terms are separate enrolments).
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

interface Props {
  programs: TermProgram[];
}

export default function SessionTable({ programs }: Props) {
  return (
    <section id="timetable" className="py-16 lg:py-20 bg-[#0A0A0A] scroll-mt-24 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-10">
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
              THE <span className="text-[#7E57C2]">TIMETABLE</span>
            </h2>
            <p className="text-gray-500 text-sm mt-4 max-w-xl">
              Classes are grouped by ability, not age. Ages 8 to 18.
            </p>
          </div>
        </SectionReveal>

        {programs.length > 0 ? (
          <>
            {/* Desktop / tablet: table */}
            <SectionReveal>
              <div className="hidden sm:block overflow-hidden border border-white/[0.08]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.04] text-gray-400 font-heading text-xs tracking-[0.2em] uppercase">
                      <th className="px-5 py-4 font-normal">Day</th>
                      <th className="px-5 py-4 font-normal">Level</th>
                      <th className="px-5 py-4 font-normal">Time</th>
                      <th className="px-5 py-4 font-normal">Location</th>
                      <th className="px-5 py-4 font-normal text-right">Enrol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((p) => {
                      const level = displayLevel(p);
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
                          <td className="px-5 py-5">
                            <span className={`inline-block border ${levelClass(level)} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                              {level}
                            </span>
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
                          <td className="px-5 py-5 text-right whitespace-nowrap">
                            <TrackedBookingLink
                              location="term_timetable"
                              href={`/booking/term/${p.slug}`}
                              className="inline-block text-center bg-[#5E35A8] text-white font-heading text-sm px-5 py-2.5 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide"
                            >
                              ENROL
                            </TrackedBookingLink>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionReveal>

            {/* Mobile: compact cards with a prominent venue and a slim enrol button */}
            <div className="sm:hidden space-y-3">
              {programs.map((p) => {
                const level = displayLevel(p);
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
                    <TrackedBookingLink
                      location="term_timetable"
                      href={`/booking/term/${p.slug}`}
                      className="inline-block text-center bg-[#5E35A8] text-white font-heading text-sm px-7 py-2 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide"
                    >
                      ENROL
                    </TrackedBookingLink>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm border border-white/[0.08] p-6">
            Enrolments for the upcoming term open soon. Get in touch and we&apos;ll let you know the
            moment classes go live.
          </p>
        )}
      </div>
    </section>
  );
}
