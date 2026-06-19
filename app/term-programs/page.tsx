import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import SessionTable from "./SessionTable";
import CoachCard from "@/components/CoachCard";
import TrackPixelView from "@/components/TrackPixelView";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import { loadTermPrograms, weekday } from "@/lib/booking/load";

// Term sessions, dates and prices come live from Supabase (loadTermPrograms),
// so this renders at request time with the runtime env that holds the secret.
export const dynamic = "force-dynamic";

// Timetable order: earlier in the week first (Mon -> Sun), then by start time.
const DAY_ORDER: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7,
};

const WEST_RYDE_MAPS = "https://maps.app.goo.gl/eByotpKjs2mcs4AL8";
const KELLYVILLE_MAPS = "https://www.google.com/maps/search/?api=1&query=Kellyville+High+School";

export const metadata: Metadata = {
  title:
    "Weekly Training | West Ryde & Kellyville Volleyball Sydney | Obsidian Volleyball Academy",
  description:
    "Junior volleyball classes across Sydney at Obsidian Volleyball Academy West Ryde and Kellyville. Beginner, intermediate, and advanced sessions for ages 8 to 18, grouped by ability. Book a trial to start.",
  keywords: [
    "junior volleyball West Ryde",
    "junior volleyball Kellyville",
    "junior volleyball classes Sydney",
    "volleyball lessons West Ryde",
    "volleyball lessons Kellyville",
    "junior volleyball coaching Sydney",
    "kids volleyball Sydney",
  ],
  alternates: { canonical: "/term-programs" },
  openGraph: {
    title:
      "Weekly Training | West Ryde & Kellyville Volleyball Sydney | Obsidian Volleyball Academy",
    description:
      "Junior volleyball classes across Sydney at Obsidian Volleyball Academy West Ryde and Kellyville.",
    images: ["/images/gallery-spike.jpg"],
    url: "/term-programs",
  },
};

// Curriculum levels (static reference content, shown as info cards).
const LEVELS = [
  {
    level: "Beginner",
    description:
      "Brand new to volleyball. We teach the fundamentals from scratch: passing, setting, serving, and how the game is played.",
    image: "/images/gallery-coaching.jpg",
  },
  {
    level: "Intermediate",
    description:
      "Comfortable with the basics. We build positional play, rotations, serve-receive, and team systems so players can read the game.",
    image: "/images/gallery-game.jpg",
  },
  {
    level: "Advanced",
    description:
      "Plays organised competitive volleyball (e.g. YSVL). Higher tempo, full-court play, tactics, and skill polish for the next level.",
    image: "/images/gallery-spike.jpg",
  },
];

const HOW_WE_RUN = [
  "Multiple courts running every session, so players are grouped by ability and coached at the right level.",
  "Small coaching ratios with experienced coaches who play at premier-league and representative level.",
  "A structured term curriculum that builds skills week on week, not random drills.",
  "Every session blends technical work with real game play, because kids learn fastest by playing.",
];

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Weekly Training | Obsidian Volleyball Academy",
  description:
    "Junior volleyball classes at Obsidian Volleyball Academy West Ryde and Kellyville. Quality coaching for ages 8 to 18, grouped by ability.",
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

export default async function JuniorClassesPage() {
  const programs = (await loadTermPrograms())
    .filter((p) => !p.is_adult)
    .sort((a, b) => {
      const da = a.first_session_at ? DAY_ORDER[weekday(a.first_session_at)] ?? 99 : 99;
      const db = b.first_session_at ? DAY_ORDER[weekday(b.first_session_at)] ?? 99 : 99;
      if (da !== db) return da - db;
      return (a.first_session_at ?? "").localeCompare(b.first_session_at ?? "");
    });

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
              WEST RYDE &middot; KELLYVILLE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              WEEKLY
              <br />
              <span className="text-[#7E57C2]">TRAINING</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Junior volleyball for every level, beginner to advanced. We group players by ability
              and coach each one at the right level, across two Sydney venues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedBookingLink
                location="term_programs_hero"
                href="/booking/term/junior"
                className="inline-block bg-[#5E35A8] text-white font-heading text-xl sm:text-2xl px-9 py-4 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide glow-purple text-center"
              >
                ENROL NOW
              </TrackedBookingLink>
              <Link
                href="/coaches"
                className="inline-block border border-white/20 text-white font-heading text-xl sm:text-2xl px-9 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide text-center"
              >
                MEET THE COACHES
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Flat timetable — every session, straight from the DB */}
      <SessionTable programs={programs} />

      {/* How enrolment works — the two-week try-before-you-pay model.
          NOTE: copy describes the intended model; the booking flow still
          charges upfront. The deferred-payment mechanism is a backend TODO and
          must ship before this goes to production. */}
      <section className="py-16 lg:py-20 bg-[#0A0A0A] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-10">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">TRY BEFORE YOU PAY</p>
              <h2 className="font-heading text-4xl sm:text-5xl text-white tracking-wide">
                HOW ENROLMENT <span className="text-[#7E57C2]">WORKS</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "01", h: "Enrol now", b: "Reserve your child's spot with nothing to pay upfront." },
              { n: "02", h: "Try two weeks", b: "Come along for the first two weeks and see if it's the right fit." },
              { n: "03", h: "Decide", b: "Love it? You're set for the term and pay for the full term, including those two weeks. Not for you? You pay nothing." },
            ].map((s, i) => (
              <SectionReveal key={s.n} delay={i * 0.1}>
                <div className="h-full border border-white/[0.08] bg-[#111] p-7">
                  <p className="font-heading text-3xl text-[#7E57C2] mb-3">{s.n}</p>
                  <h3 className="font-heading text-xl text-white tracking-wide mb-2">{s.h}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.b}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TODO(dan): rework this 'how we run sessions' section — Dan to give feedback on copy/angle. */}
      {/* How we run sessions */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
            <SectionReveal>
              <div className="aspect-[4/3] relative overflow-hidden border border-white/[0.08]">
                <Image
                  src="/images/gallery-coaching.jpg"
                  alt="Coaches running a junior volleyball session at Obsidian Volleyball Academy"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div>
                <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">HOW WE RUN SESSIONS</p>
                <h2 className="font-heading text-3xl lg:text-5xl text-white tracking-wide leading-[0.95] mb-6">
                  COACHED AT THE
                  <br />
                  <span className="text-[#7E57C2]">RIGHT LEVEL</span>
                </h2>
                <ul className="space-y-4">
                  {HOW_WE_RUN.map((point, i) => (
                    <li key={i} className="flex gap-3 text-gray-400 text-base leading-relaxed">
                      <span className="text-[#7E57C2] font-heading flex-shrink-0 mt-0.5">+</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Curriculum / levels */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">OUR CURRICULUM</p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                THREE <span className="text-[#7E57C2]">LEVELS</span>
              </h2>
              <p className="text-gray-500 text-sm mt-4 max-w-xl">
                We group players by ability, not age, so every child is challenged and supported.
                Players move up as they are ready.
              </p>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {LEVELS.map((lvl, i) => (
              <SectionReveal key={lvl.level} delay={i * 0.1}>
                <div className="h-full flex flex-col border border-white/[0.08] bg-[#111] overflow-hidden">
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <Image
                      src={lvl.image}
                      alt={`${lvl.level} junior volleyball at Obsidian Volleyball Academy`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      quality={80}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="font-heading text-2xl text-[#7E57C2] tracking-wide mb-3">{lvl.level}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{lvl.description}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches + philosophy */}
      <section className="py-20 lg:py-28 bg-[#111] border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div className="max-w-2xl">
                <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">WHO COACHES YOUR CHILD</p>
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide mb-5">
                  OUR <span className="text-[#7E57C2]">COACHES</span>
                </h2>
                <p className="text-gray-400 text-base leading-relaxed">
                  Every session is led by coaches who still play at premier-league and representative
                  level. They are here to develop players and people: strong fundamentals, a love of
                  the game, and the confidence to compete.
                </p>
              </div>
              <Link
                href="/coaches"
                className="shrink-0 inline-flex items-center gap-2 text-[#7E57C2] hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors"
              >
                Meet the full team
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <CoachCard
              name="Chris"
              role="Coach"
              bio="Plays in Sydney's Men's Premier Volleyball League. Passes years of senior-level experience straight to the next generation."
              qualifications={["Men's Premier Volleyball League", "Sydney North Gold & MVP"]}
              image="/images/coach-chris-card.png"
              index={0}
            />
            <CoachCard
              name="Kaveesh"
              role="Coach"
              bio="Years of representative volleyball with a passion for coaching juniors. Energy and technical knowledge make sessions fun and effective."
              qualifications={["16s NSWCHS State Team", "2022 18s SVL Champions"]}
              image="/images/coach-kaveesh-card.jpg"
              index={1}
            />
            <CoachCard
              name="Melinda"
              role="Coach"
              bio="Years of competitive volleyball experience and a deep commitment to junior development. Currently plays in the Sydney Women's Premier League."
              qualifications={["NSWCHS Opens Champion", "NSW & SW Blues Award"]}
              image="/images/coach-melinda-card.jpg"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Our venues */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">WHERE WE PLAY</p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                TWO <span className="text-[#7E57C2]">VENUES</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* West Ryde */}
            <SectionReveal>
              <a href={WEST_RYDE_MAPS} target="_blank" rel="noopener noreferrer" className="block group h-full">
                <div className="h-full border border-white/[0.08] bg-[#0A0A0A] overflow-hidden flex flex-col">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src="/images/venue-west-ryde.jpg"
                      alt="Obsidian Volleyball Academy West Ryde indoor courts"
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={85}
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] uppercase mb-2">Term classes</p>
                    <h3 className="font-heading text-2xl text-white tracking-wide mb-2">Obsidian Volleyball Academy West Ryde</h3>
                    <p className="text-gray-500 text-sm mb-4">West Ryde, NSW. Indoor courts, climate controlled, plenty of parking.</p>
                    <span className="inline-flex items-center gap-2 text-[#7E57C2] group-hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      View on Google Maps
                    </span>
                  </div>
                </div>
              </a>
            </SectionReveal>
            {/* Kellyville */}
            <SectionReveal delay={0.15}>
              <a href={KELLYVILLE_MAPS} target="_blank" rel="noopener noreferrer" className="block group h-full">
                <div className="h-full border border-[#7E57C2]/30 bg-[#0A0A0A] overflow-hidden flex flex-col">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <Image
                      src="/images/gallery-game.jpg"
                      alt="Junior volleyball coaching, launching at Obsidian Volleyball Academy Kellyville"
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={85}
                    />
                  </div>
                  <div className="p-6 flex-grow">
                    <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] uppercase mb-2">Term classes</p>
                    <h3 className="font-heading text-2xl text-white tracking-wide mb-2">Obsidian Volleyball Academy Kellyville</h3>
                    <p className="text-gray-500 text-sm mb-4">Kellyville High School, cnr York Road &amp; Queensbury Avenue, Kellyville NSW 2155.</p>
                    <span className="inline-flex items-center gap-2 text-[#7E57C2] group-hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      View on Google Maps
                    </span>
                  </div>
                </div>
              </a>
            </SectionReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
