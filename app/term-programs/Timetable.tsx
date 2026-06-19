import TrackedBookingLink from "@/components/TrackedBookingLink";
import SectionReveal from "@/components/SectionReveal";

// A single, scannable view of every term session across both venues so a
// first-time parent gets the whole picture without clicking into anything.
// West Ryde sessions enrol directly; Kellyville is a Term 3 launch and routes
// to interest capture until enrolment opens.
type Action =
  | { kind: "enrol"; href: string }
  | { kind: "interest"; href: string; note: string };

interface Row {
  day: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  time: string;
  venue: string;
  venueSub: string;
  action: Action;
}

// TODO: repoint Kellyville interest href to the new trial/interest form once it ships.
const KELLYVILLE_INTEREST = "/contact";

const ROWS: Row[] = [
  { day: "Friday", level: "Beginner", time: "4:00 – 5:30 PM", venue: "West Ryde", venueSub: "Obsidian Academy", action: { kind: "enrol", href: "/booking/term/fri-beginners-4pm" } },
  { day: "Friday", level: "Intermediate", time: "4:00 – 5:30 PM", venue: "West Ryde", venueSub: "Obsidian Academy", action: { kind: "enrol", href: "/booking/term/fri-intermediate-4pm" } },
  { day: "Friday", level: "Intermediate", time: "5:30 – 7:00 PM", venue: "West Ryde", venueSub: "Obsidian Academy", action: { kind: "enrol", href: "/booking/term/fri-intermediate-530pm" } },
  { day: "Friday", level: "Advanced", time: "5:30 – 7:00 PM", venue: "West Ryde", venueSub: "Obsidian Academy", action: { kind: "enrol", href: "/booking/term/fri-advanced-530pm" } },
  { day: "Tuesday", level: "Beginner", time: "4:00 – 5:30 PM", venue: "Kellyville", venueSub: "Kellyville High School", action: { kind: "interest", href: KELLYVILLE_INTEREST, note: "Starts Term 3" } },
  { day: "Wednesday", level: "Intermediate", time: "4:00 – 5:30 PM", venue: "Kellyville", venueSub: "Kellyville High School", action: { kind: "interest", href: KELLYVILLE_INTEREST, note: "Starts Term 3" } },
];

const LEVEL_COLOR: Record<Row["level"], string> = {
  Beginner: "text-emerald-400 border-emerald-400/30",
  Intermediate: "text-[#7E57C2] border-[#7E57C2]/40",
  Advanced: "text-amber-400 border-amber-400/30",
};

function ActionButton({ action }: { action: Action }) {
  if (action.kind === "enrol") {
    return (
      <TrackedBookingLink
        location="term_timetable"
        href={action.href}
        className="inline-block w-full sm:w-auto text-center bg-[#5E35A8] text-white font-heading text-sm px-5 py-2.5 hover:bg-[#7E57C2] transition-colors duration-300 tracking-wide"
      >
        ENROL
      </TrackedBookingLink>
    );
  }
  return (
    <TrackedBookingLink
      location="kellyville_interest"
      href={action.href}
      className="inline-block w-full sm:w-auto text-center border border-[#7E57C2]/40 text-[#7E57C2] font-heading text-sm px-5 py-2.5 hover:bg-[#7E57C2] hover:text-white transition-colors duration-300 tracking-wide"
    >
      REGISTER INTEREST
    </TrackedBookingLink>
  );
}

export default function Timetable() {
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
              child? Register interest and we&apos;ll help you place them.
            </p>
          </div>
        </SectionReveal>

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
                  <th className="px-5 py-4 font-normal text-right">Enrol</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr key={i} className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-5 text-white font-heading tracking-wide">{r.day}</td>
                    <td className="px-5 py-5">
                      <span className={`inline-block border ${LEVEL_COLOR[r.level]} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                        {r.level}
                      </span>
                    </td>
                    <td className="px-5 py-5 text-gray-300 text-sm">{r.time}</td>
                    <td className="px-5 py-5">
                      <span className="text-white text-sm">{r.venue}</span>
                      <span className="block text-gray-600 text-xs">{r.venueSub}</span>
                      {r.action.kind === "interest" && (
                        <span className="inline-block mt-1 text-[#7E57C2] text-[10px] font-heading tracking-[0.2em] uppercase">{r.action.note}</span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-right whitespace-nowrap">
                      <ActionButton action={r.action} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionReveal>

        {/* Mobile: stacked cards */}
        <div className="sm:hidden space-y-3">
          {ROWS.map((r, i) => (
            <div key={i} className="border border-white/[0.08] p-5 bg-[#111]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-heading text-lg tracking-wide">{r.day}</span>
                <span className={`inline-block border ${LEVEL_COLOR[r.level]} text-xs font-heading tracking-wide px-3 py-1 rounded-full`}>
                  {r.level}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{r.time}</p>
              <p className="text-gray-400 text-sm">
                {r.venue} <span className="text-gray-600">· {r.venueSub}</span>
              </p>
              {r.action.kind === "interest" && (
                <p className="text-[#7E57C2] text-[10px] font-heading tracking-[0.2em] uppercase mt-1">{r.action.note}</p>
              )}
              <div className="mt-4">
                <ActionButton action={r.action} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
