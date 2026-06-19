import TrackedBookingLink from "@/components/TrackedBookingLink";
import SectionReveal from "@/components/SectionReveal";
import { weekday, timeRange, type TermProgram } from "@/lib/booking/load";

// Flat, no-click view of every term session. Data comes straight from Supabase
// (loadTermPrograms) so Dan's DB edits flow through with no code change.
// Kellyville is shown as a Term 3 launch callout until its sessions are added
// to the DB, at which point they appear in the table automatically.

const LEVEL_COLOR: Record<string, string> = {
  beginner: "text-emerald-400 border-emerald-400/30",
  intermediate: "text-[#7E57C2] border-[#7E57C2]/40",
  advanced: "text-amber-400 border-amber-400/30",
  mixed: "text-sky-400 border-sky-400/30",
};

function cap(s: string | null): string {
  if (!s) return "All levels";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function dollars(cents: number): string {
  return `$${Math.round(cents / 100)}`;
}

function levelClass(level: string | null): string {
  return LEVEL_COLOR[(level ?? "").toLowerCase()] ?? "text-gray-300 border-white/20";
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
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">EVERY SESSION, AT A GLANCE</p>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
              THE <span className="text-[#7E57C2]">TIMETABLE</span>
            </h2>
            <p className="text-gray-500 text-sm mt-4 max-w-xl">
              Players are grouped by ability, not age. Ages 8 to 18. Not sure which level fits your
              child? Book a trial and we&apos;ll help place them.
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
                      <th className="px-5 py-4 font-normal">Venue</th>
                      <th className="px-5 py-4 font-normal">Per week</th>
                      <th className="px-5 py-4 font-normal text-right">Enrol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((p) => (
                      <tr key={p.id} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-5 text-white font-heading tracking-wide">
                          {p.first_session_at ? weekday(p.first_session_at) : "TBA"}
                        </td>
                        <td className="px-5 py-5">
                          <span className={`inline-block border ${levelClass(p.skill_level)} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                            {cap(p.skill_level)}
                          </span>
                        </td>
                        <td className="px-5 py-5 text-gray-300 text-sm whitespace-nowrap">
                          {p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : "TBA"}
                        </td>
                        <td className="px-5 py-5 text-white text-sm">{p.venue_name}</td>
                        <td className="px-5 py-5 text-gray-300 text-sm whitespace-nowrap">
                          {dollars(p.per_week_cents)}
                          {p.weeks_remaining > 0 && (
                            <span className="block text-gray-600 text-xs">{p.weeks_remaining} weeks left</span>
                          )}
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
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionReveal>

            {/* Mobile: stacked cards */}
            <div className="sm:hidden space-y-3">
              {programs.map((p) => (
                <div key={p.id} className="border border-white/[0.08] p-5 bg-[#111]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-heading text-lg tracking-wide">
                      {p.first_session_at ? weekday(p.first_session_at) : "TBA"}
                    </span>
                    <span className={`inline-block border ${levelClass(p.skill_level)} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                      {cap(p.skill_level)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : "TBA"}
                  </p>
                  <p className="text-gray-400 text-sm">{p.venue_name}</p>
                  <p className="text-gray-300 text-sm mt-1">
                    {dollars(p.per_week_cents)}<span className="text-gray-600"> / week</span>
                  </p>
                  <div className="mt-4">
                    <TrackedBookingLink
                      location="term_timetable"
                      href={`/booking/term/${p.slug}`}
                      className="inline-block w-full text-center bg-[#5E35A8] text-white font-heading text-sm px-5 py-2.5 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide"
                    >
                      ENROL
                    </TrackedBookingLink>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm border border-white/[0.08] p-6">
            Enrolments for the upcoming term open soon. Register your interest and we&apos;ll let you know
            the moment classes go live.
          </p>
        )}

        {/* Kellyville — launching Term 3 (not yet in the DB) */}
        <SectionReveal>
          <div className="mt-6 border border-[#7E57C2]/30 bg-[#7E57C2]/[0.06] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] uppercase mb-2">Launching Term 3</p>
                <h3 className="font-heading text-2xl text-white tracking-wide mb-2">Obsidian Volleyball Academy Kellyville</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
                  New sessions at Kellyville High School: <span className="text-white">Tuesday Beginner</span> and{" "}
                  <span className="text-white">Wednesday Intermediate</span>, 4:00 – 5:30 PM.
                  First two weeks free, then $36 per week.
                </p>
              </div>
              <TrackedBookingLink
                location="kellyville_interest"
                href="/contact"
                className="shrink-0 inline-block text-center border border-[#7E57C2]/50 text-[#7E57C2] font-heading text-sm px-6 py-3 hover:bg-[#7E57C2] hover:text-white transition-colors duration-300 tracking-wide"
              >
                REGISTER INTEREST
              </TrackedBookingLink>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
