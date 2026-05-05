import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import LevelPicker, { type Venue, type LevelInfo } from "./LevelPicker";
import TrackPixelView from "@/components/TrackPixelView";

export const metadata: Metadata = {
  title:
    "Junior Classes | West Ryde Volleyball Sydney | Obsidian Volleyball Academy",
  description:
    "Premium junior volleyball classes every Friday at Bennelong Sports Centre, West Ryde. Beginner, intermediate, and advanced sessions for ages 8 to 18. Now launching with 20% off and a free training shirt.",
  keywords: [
    "junior volleyball West Ryde",
    "junior volleyball classes Sydney",
    "volleyball lessons West Ryde",
    "junior volleyball coaching Sydney",
    "kids volleyball Sydney",
    "volleyball Bennelong Sports Centre",
  ],
  alternates: { canonical: "/term-programs" },
  openGraph: {
    title:
      "Junior Classes | West Ryde Volleyball Sydney | Obsidian Volleyball Academy",
    description:
      "Premium junior volleyball classes every Friday at Bennelong Sports Centre, West Ryde.",
    images: ["/images/gallery-spike.jpg"],
    url: "/term-programs",
  },
};

// Online enrolment via Acuity is not wired up yet for term programs.
// Replace with a per-program appointmentType URL when Acuity is live.
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
      { time: "6:00 – 8:00 PM", levels: ["Intermediate", "Advanced"] },
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
  name: "Junior Classes | Obsidian Volleyball Academy",
  description:
    "Junior volleyball classes at Bennelong Sports Centre, West Ryde. Premium coaching every Friday for ages 8 to 18.",
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

export default function JuniorClassesPage() {
  return (
    <div className="pt-20">
      <TrackPixelView contentName="junior_classes" contentCategory="program" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              NOW LAUNCHING &middot; WEST RYDE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              JUNIOR
              <br />
              <span className="text-[#9B4FDE]">CLASSES</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Premium junior volleyball coaching every Friday at Bennelong Sports
              Centre, West Ryde. Two indoor courts, expert coaches, ages 8 to 18.
              Pick your level below.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Choose your level */}
      <section id="levels" className="py-12 lg:py-16 bg-[#0A0A0A] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <LevelPicker
            levels={LEVELS}
            venues={VENUES}
            enrolHref={ENROL_PLACEHOLDER}
          />
        </div>
      </section>

      {/* Venue showcase */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
            <SectionReveal>
              <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.08]">
                <Image
                  src="/images/bennelong-courtyard.png"
                  alt="Bennelong Sports Centre indoor courts, West Ryde"
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
                  Bennelong Sports Centre &middot; West Ryde, NSW
                </p>
              </div>
            </SectionReveal>
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
              JOIN THE CLUB
            </p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              SAVE YOUR
              <br />
              <span className="text-[#9B4FDE]">SPOT</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Cohorts are small. Reach out and we&apos;ll book you in.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              GET IN TOUCH
            </Link>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              BENNELONG SPORTS CENTRE &middot; WEST RYDE &middot; AGES 8&ndash;18
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
