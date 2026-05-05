import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import LevelPicker, { type Venue, type LevelInfo } from "./LevelPicker";
import TrackPixelView from "@/components/TrackPixelView";

export const metadata: Metadata = {
  title:
    "Junior Volleyball Term Programs | West Ryde Sydney | Obsidian Volleyball Academy",
  description:
    "Premium junior volleyball training every Friday at Bennelong Sports Centre, West Ryde. Beginner, intermediate, and advanced sessions. Now launching with 20% off and a free training shirt.",
  keywords: [
    "junior volleyball West Ryde",
    "volleyball lessons West Ryde",
    "junior volleyball coaching Sydney",
    "school term volleyball Sydney",
    "volleyball Bennelong Sports Centre",
    "weekly volleyball training",
  ],
  alternates: { canonical: "/term-programs" },
  openGraph: {
    title:
      "Junior Volleyball Term Programs | West Ryde Sydney | Obsidian Volleyball Academy",
    description:
      "Premium junior volleyball training every Friday at Bennelong Sports Centre, West Ryde.",
    images: ["/images/gallery-spike.jpg"],
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
    id: "bennelong",
    name: "Bennelong Sports Centre",
    suburb: "West Ryde",
    day: "Friday",
    coaches: [
      { name: "Kaveesh", slug: "kaveesh", image: "/images/coach-kaveesh-card.jpg" },
      { name: "Chris", slug: "chris" },
    ],
    slots: [
      { time: "4:00 – 6:00 PM", levels: ["Beginner", "Intermediate"] },
      { time: "6:00 – 8:00 PM", levels: ["Beginner", "Intermediate"] },
      { time: "8:00 – 10:00 PM", levels: ["Intermediate", "Advanced"] },
    ],
  },
];

const LEVELS: LevelInfo[] = [
  {
    level: "Beginner",
    description:
      "We teach you everything: passing, setting, serving, and the fundamentals of the game.",
    image: "/images/gallery-coaching.jpg",
  },
  {
    level: "Intermediate",
    description:
      "Comfortable with the basics. Working on positional play, rotations, and team systems.",
    image: "/images/gallery-game.jpg",
  },
  {
    level: "Advanced",
    description:
      "Plays organised competitive volleyball, e.g. YSVL. Higher tempo, full-court play, tactics, and skill polish.",
    image: "/images/gallery-spike.jpg",
  },
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "School Term Programs | Obsidian Volleyball Academy",
  description:
    "Weekly junior volleyball training across two Sydney venues. Beginner, intermediate, and advanced school term programs.",
  provider: {
    "@type": "SportsOrganization",
    name: "Obsidian Volleyball Academy",
    url: "https://obsidianvolleyball.com",
  },
  educationalLevel: "Beginner, Intermediate, Advanced",
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 18,
  },
};

export default function TermProgramsPage() {
  return (
    <div className="pt-20">
      <TrackPixelView contentName="term_programs" contentCategory="program" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      {/* Hero — slim, level-led */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              NOW LAUNCHING &middot; WEST RYDE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              SCHOOL TERM
              <br />
              <span className="text-[#9B4FDE]">PROGRAMS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Premium junior volleyball coaching every Friday at Bennelong Sports Centre,
              West Ryde. Two indoor courts, three sessions, expert coaches. Pick your level
              below.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Venue showcase */}
      <section className="py-12 lg:py-16 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
            <SectionReveal>
              <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.08]">
                <Image
                  src="/images/venue.jpg"
                  alt="Bennelong Sports Centre indoor volleyball courts"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">THE VENUE</p>
                <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95] mb-6">
                  BENNELONG
                  <br />
                  <span className="text-[#9B4FDE]">SPORTS CENTRE</span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mb-4">
                  Two full-size indoor courts in West Ryde, climate-controlled, plenty of
                  parking. Sessions run rain or shine, every Friday during the school term.
                </p>
                <p className="text-gray-500 text-sm">
                  Bennelong Sports Centre West &middot; West Ryde, NSW
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Step 1 — Choose your level */}
      <section id="levels" className="py-16 lg:py-20 bg-[#0A0A0A] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-10">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                STEP 1
              </p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95]">
                CHOOSE YOUR
                <br />
                <span className="text-[#9B4FDE]">LEVEL</span>
              </h2>
            </div>
          </SectionReveal>
          <LevelPicker
            levels={LEVELS}
            venues={VENUES}
            enrolHref={ENROL_PLACEHOLDER}
          />
        </div>
      </section>

      {/* Enrolment notice */}
      <section className="py-16 bg-[#111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#9B4FDE]/30 bg-[#0F0F0F] p-8 lg:p-10">
            <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-4">
              ENROLMENT OPENS SOON
            </p>
            <p className="text-white text-lg leading-relaxed mb-3">
              Online bookings for Term 2 are being set up.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              For now, every &ldquo;enrol&rdquo; button points to our contact
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
              BENNELONG SPORTS CENTRE &middot; WEST RYDE &middot; ALL SKILL LEVELS
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
