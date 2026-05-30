import type { Metadata } from "next";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import LevelPicker, { type Venue, type LevelInfo } from "./LevelPicker";
import TrackPixelView from "@/components/TrackPixelView";
import TrackedBookingLink from "@/components/TrackedBookingLink";

const TRIAL_URL = "/booking/trial";
const MAPS_URL = "https://maps.app.goo.gl/eByotpKjs2mcs4AL8";

export const metadata: Metadata = {
  title:
    "Junior Classes | West Ryde Volleyball Sydney | Obsidian Volleyball Academy",
  description:
    "Premium junior volleyball classes every Friday at Obsidian Volleyball Academy West Ryde. Beginner, intermediate, and advanced sessions for ages 8 to 18. Now launching with 20% off and a free training shirt.",
  keywords: [
    "junior volleyball West Ryde",
    "junior volleyball classes Sydney",
    "volleyball lessons West Ryde",
    "junior volleyball coaching Sydney",
    "kids volleyball Sydney",
    "Obsidian Volleyball Academy West Ryde",
  ],
  alternates: { canonical: "/term-programs" },
  openGraph: {
    title:
      "Junior Classes | West Ryde Volleyball Sydney | Obsidian Volleyball Academy",
    description:
      "Premium junior volleyball classes every Friday at Obsidian Volleyball Academy West Ryde.",
    images: ["/images/gallery-spike.jpg"],
    url: "/term-programs",
  },
};

const CHRIS = {
  name: "Chris",
  slug: "chris",
  image: "/images/coach-chris-card.png",
};
const KAVEESH = {
  name: "Kaveesh",
  slug: "kaveesh",
  image: "/images/coach-kaveesh-card.jpg",
};

// On-site enrol pages, one per class. Each opens the class with full-term and
// 1-week-trial options.
const ACUITY = {
  beg_4pm: "/booking/term/fri-beginners-4pm",
  int_4pm: "/booking/term/fri-intermediate-4pm",
  int_530pm: "/booking/term/fri-intermediate-530pm",
  adv_530pm: "/booking/term/fri-advanced-530pm",
};

const VENUES: Venue[] = [
  {
    id: "bennelong",
    name: "Obsidian Volleyball Academy West Ryde",
    suburb: "West Ryde",
    day: "Friday",
    slots: [
      {
        time: "4:00 – 5:30 PM",
        courts: [
          { level: "Beginner", coach: CHRIS, enrolHref: ACUITY.beg_4pm },
          { level: "Intermediate", coach: KAVEESH, enrolHref: ACUITY.int_4pm },
        ],
      },
      {
        time: "5:30 – 7:00 PM",
        courts: [
          { level: "Intermediate", coach: CHRIS, enrolHref: ACUITY.int_530pm },
          { level: "Advanced", coach: KAVEESH, enrolHref: ACUITY.adv_530pm },
        ],
      },
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
    "Junior volleyball classes at Obsidian Volleyball Academy West Ryde. Premium coaching every Friday for ages 8 to 18.",
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
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">
              NOW LAUNCHING &middot; WEST RYDE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              JUNIOR
              <br />
              <span className="text-[#7E57C2]">CLASSES</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Junior classes for all levels, beginner to advanced. We run multiple courts
              each session with experienced coaches, group players by ability, and coach
              every player at the right level for them. Term 2 enrolment open.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedBookingLink
                location="term_programs_hero"
                href="/booking/term/junior"
                className="inline-block bg-[#5E35A8] text-white font-heading text-xl sm:text-2xl px-9 py-4 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide glow-purple text-center"
              >
                ENROL IN A CLASS
              </TrackedBookingLink>
              <TrackedBookingLink
                location="term_programs_hero"
                href={TRIAL_URL}
                className="inline-block border border-white/20 text-white font-heading text-xl sm:text-2xl px-9 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide text-center"
              >
                BOOK A TRIAL
              </TrackedBookingLink>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Choose your level */}
      <section id="levels" className="py-12 lg:py-16 bg-[#0A0A0A] scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <LevelPicker
            levels={LEVELS}
            venues={VENUES}
          />
        </div>
      </section>

      {/* Venue showcase */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12 items-center">
            <SectionReveal>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.08]">
                  <Image
                    src="/images/venue-west-ryde.jpg"
                    alt="Obsidian Volleyball Academy West Ryde indoor courts"
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                </div>
              </a>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div>
                <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">THE VENUE</p>
                <h2 className="font-heading text-3xl lg:text-5xl text-white tracking-wide leading-[0.95] mb-6">
                  OBSIDIAN VOLLEYBALL
                  <br />
                  <span className="text-[#7E57C2]">ACADEMY WEST RYDE</span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mb-4">
                  State-of-the-art indoor volleyball courts in West Ryde,
                  climate-controlled, plenty of parking. Sessions run rain or shine,
                  every Friday during the school term.
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Obsidian Volleyball Academy &middot; West Ryde, NSW
                </p>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#7E57C2] hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>View on Google Maps</span>
                </a>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

    </div>
  );
}
