import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";
import VenuePicker, { type Venue } from "./VenuePicker";

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

const LEVEL_BLURB: Record<"Beginner" | "Intermediate" | "Advanced", string> = {
  Beginner:
    "No experience required. Build the basics: passing, setting, serving, ball control.",
  Intermediate:
    "Refine technique, learn rotations and team play, work on spike and block.",
  Advanced:
    "Higher tempo, full-court game play, tactics and skill polish. Suited to club or rep players.",
};

export default function TermProgramsPage() {
  return (
    <div className="pt-20">
      {/* Hero — kept tight, location-led */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              WEEKLY TRAINING
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              TERM
              <br />
              <span className="text-[#9B4FDE]">PROGRAMS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Two Sydney venues, two evenings a week. Pick a location below to see
              times and levels.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Location picker — top of fold under hero */}
      <section id="locations" className="py-16 lg:py-20 bg-[#0A0A0A] scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-10">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                STEP 1
              </p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide">
                CHOOSE A LOCATION
              </h2>
            </div>
          </SectionReveal>
          <VenuePicker venues={VENUES} enrolHref={ENROL_PLACEHOLDER} />
        </div>
      </section>

      {/* Levels — supporting info, lighter density */}
      <section className="py-20 lg:py-24 bg-[#111]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-10">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                ABOUT THE LEVELS
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide">
                WHAT EACH GROUP COVERS
              </h2>
            </div>
          </SectionReveal>
          <p className="text-gray-500 text-sm max-w-2xl mb-8">
            Players are grouped by skill, not age. Both courts run in parallel so
            cohorts stay tight.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
            {(["Beginner", "Intermediate", "Advanced"] as const).map((level) => (
              <div
                key={level}
                className="bg-[#111] p-8 group hover:bg-[#161616] transition-colors duration-500 h-full"
              >
                <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-5 uppercase">
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

      {/* Enrolment notice */}
      <section className="py-16 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#9B4FDE]/30 bg-[#0F0F0F] p-8 lg:p-10">
            <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-4">
              ENROLMENT OPENS SOON
            </p>
            <p className="text-white text-lg leading-relaxed mb-3">
              Online bookings for Term 2 programs are being set up.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              For now, every &ldquo;enrol&rdquo; button points to our contact form.
              Get in touch and we&apos;ll lock in your spot manually, then switch
              you over once online enrolment goes live.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center relative overflow-hidden">
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
