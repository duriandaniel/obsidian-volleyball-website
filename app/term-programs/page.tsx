import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Term Programs | West Ryde + Parramatta Volleyball | Obsidian",
  description:
    "Weekly junior volleyball training in West Ryde (Friday) and Parramatta (Thursday). Beginner, intermediate, and advanced sessions for Term 2.",
  alternates: { canonical: "/term-programs" },
  openGraph: {
    title: "Term Programs | West Ryde + Parramatta Volleyball | Obsidian",
    description:
      "Weekly junior volleyball training in West Ryde and Parramatta. Beginner, intermediate, and advanced.",
    url: "/term-programs",
  },
};

// Online enrolment via Acuity is not wired up yet for Term 2 programs.
// All enrol CTAs point to /contact for now. When Acuity is live, replace
// the ENROL_PLACEHOLDER with the per-program appointmentType URL, e.g.
//   https://obsidianvolleyball.as.me/?appointmentType=12345678
const ENROL_PLACEHOLDER = "/contact";

type Level = "Beginner" | "Intermediate" | "Advanced";

const LEVEL_BLURB: Record<Level, string> = {
  Beginner:
    "No experience required. Build the basics: passing, setting, serving, ball control.",
  Intermediate:
    "Refine technique, learn rotations and team play, work on spike and block.",
  Advanced:
    "Higher tempo, full-court game play, tactics and skill polish. Suited to club or rep players.",
};

type Slot = { time: string; levels: Level[] };

type Venue = {
  id: string;
  suburb: string;
  name: string;
  day: string;
  coaches: { name: string; slug: string }[];
  slots: Slot[];
};

const VENUES: Venue[] = [
  {
    id: "west-ryde",
    suburb: "West Ryde",
    name: "Bennelong Sports Centre",
    day: "Fridays",
    coaches: [
      { name: "Sandeep", slug: "sandeep" },
      { name: "Kaveesh", slug: "kaveesh" },
    ],
    slots: [
      { time: "5:00 – 6:30 PM", levels: ["Beginner", "Intermediate"] },
      { time: "6:30 – 8:00 PM", levels: ["Beginner", "Intermediate"] },
      { time: "8:00 – 9:30 PM", levels: ["Intermediate", "Advanced"] },
    ],
  },
  {
    id: "parramatta",
    suburb: "Parramatta",
    name: "Kings School Sports Centre",
    day: "Thursdays",
    coaches: [
      { name: "Jessica", slug: "jessica" },
      { name: "Chris", slug: "chris" },
    ],
    slots: [
      { time: "5:00 – 6:30 PM", levels: ["Beginner", "Intermediate"] },
      { time: "6:30 – 8:00 PM", levels: ["Beginner", "Intermediate"] },
    ],
  },
];

export default function TermProgramsPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              WEEKLY TRAINING
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              TERM
              <br />
              <span className="text-[#9B4FDE]">PROGRAMS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
              Weekly junior volleyball training across two Sydney venues. Pick the
              location, day, and time that suits. Two courts at every venue means
              kids train at the right level, not the wrong one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#schedule"
                className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
              >
                VIEW SCHEDULE
              </Link>
              <Link
                href="/contact"
                className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
              >
                ASK A QUESTION
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Levels Overview */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                CHOOSE YOUR LEVEL
              </p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">
                LEVELS
              </h2>
            </div>
          </SectionReveal>
          <p className="text-gray-500 text-sm max-w-2xl mb-10">
            Players are grouped by skill, not age. Each venue runs two courts at
            once so cohorts stay tight and intensity matches the player.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
            {(["Beginner", "Intermediate", "Advanced"] as Level[]).map((level) => (
              <div
                key={level}
                className="bg-[#111] p-8 lg:p-10 group hover:bg-[#161616] transition-colors duration-500 h-full"
              >
                <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-6 uppercase">
                  {level}
                </p>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {LEVEL_BLURB[level]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule + Venues */}
      <section id="schedule" className="py-24 lg:py-32 bg-[#0A0A0A] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                TWO VENUES, TWO NIGHTS
              </p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">
                SCHEDULE
              </h2>
            </div>
          </SectionReveal>

          <div className="space-y-24">
            {VENUES.map((venue) => (
              <VenueBlock key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
      </section>

      {/* Enrolment notice */}
      <section className="py-16 bg-[#111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#9B4FDE]/30 bg-[#0A0A0A] p-8 lg:p-10">
            <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-4">
              ENROLMENT OPENS SOON
            </p>
            <p className="text-white text-lg leading-relaxed mb-3">
              Online bookings for Term 2 programs are being set up.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              For now, every &ldquo;enrol&rdquo; button below points to our contact
              form. Get in touch and we&apos;ll lock in your spot manually, then
              switch you over once online enrolment goes live.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] text-center relative overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(123,47,190,0.03) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">
              JOIN A TERM PROGRAM
            </p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              SAVE YOUR
              <br />
              <span className="text-[#9B4FDE]">SPOT</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Term 2 cohorts are small. Reach out and we&apos;ll book you in.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              GET IN TOUCH
            </Link>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              WEST RYDE &middot; PARRAMATTA &middot; ALL SKILL LEVELS
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

function VenueBlock({ venue }: { venue: Venue }) {
  return (
    <SectionReveal>
      <div>
        {/* Venue Header */}
        <div className="border-l-2 border-[#9B4FDE] pl-6 lg:pl-8 mb-10">
          <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3 uppercase">
            {venue.suburb} &middot; {venue.day}
          </p>
          <h3 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-4">
            {venue.name}
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Coached by{" "}
            {venue.coaches.map((c, i) => (
              <span key={c.slug}>
                <Link
                  href={`/coaches#${c.slug}`}
                  className="text-white hover:text-[#9B4FDE] transition-colors underline decoration-white/20 underline-offset-4 hover:decoration-[#9B4FDE]"
                >
                  {c.name}
                </Link>
                {i < venue.coaches.length - 1 ? " and " : ""}
              </span>
            ))}
            . Two courts run in parallel each session.
          </p>
        </div>

        {/* Slots */}
        <div className="space-y-px bg-white/[0.04]">
          {venue.slots.map((slot) => (
            <SlotRow key={slot.time} slot={slot} />
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

function SlotRow({ slot }: { slot: Slot }) {
  return (
    <div className="bg-[#0A0A0A] grid grid-cols-1 md:grid-cols-[180px_1fr] gap-px">
      {/* Time */}
      <div className="bg-[#0F0F0F] flex items-center px-6 py-6 md:py-0">
        <p className="font-heading text-xl lg:text-2xl text-[#9B4FDE] tracking-wider">
          {slot.time}
        </p>
      </div>

      {/* Court Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.04]">
        {slot.levels.map((level, i) => (
          <CourtCard key={`${level}-${i}`} level={level} />
        ))}
      </div>
    </div>
  );
}

function CourtCard({ level }: { level: Level }) {
  const isAdvanced = level === "Advanced";
  return (
    <div
      className={`bg-[#0A0A0A] p-6 lg:p-8 group hover:bg-[#111] transition-colors duration-500 ${
        isAdvanced ? "ring-1 ring-inset ring-[#9B4FDE]/20" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#9B4FDE] text-[11px] font-heading tracking-[0.3em] border border-[#9B4FDE]/20 px-3 py-1 uppercase">
          {level}
        </span>
        <span className="text-gray-700 text-[10px] tracking-wider">1.5 HR</span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 min-h-[60px]">
        {LEVEL_BLURB[level]}
      </p>
      <Link
        href={ENROL_PLACEHOLDER}
        className="inline-flex items-center gap-2 text-[#9B4FDE] font-heading text-sm tracking-[0.2em] group/btn hover:gap-3 transition-all duration-300 uppercase"
      >
        <span>Enrol</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
