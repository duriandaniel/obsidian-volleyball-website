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
const MAP_FILTER = "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)";

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
  "Players are grouped by ability, so everyone is coached and challenged at the right level.",
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
    .filter((p) => !p.is_adult && p.weeks_remaining > 0)
    .sort((a, b) => {
      const da = a.first_session_at ? DAY_ORDER[weekday(a.first_session_at)] ?? 99 : 99;
      const db = b.first_session_at ? DAY_ORDER[weekday(b.first_session_at)] ?? 99 : 99;
      if (da !== db) return da - db;
      return (a.first_session_at ?? "").localeCompare(b.first_session_at ?? "");
    });

  return (
    <div>
      <TrackPixelView contentName="junior_classes" contentCategory="program" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      {/* Hero — picture background */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0">
          <Image
            src="/images/gallery-game.jpg"
            alt="Junior volleyball training at Obsidian Volleyball Academy"
            fill
            priority
            className="object-cover opacity-60 object-[60%_center]"
            sizes="100vw"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 via-45% to-transparent to-85%" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0A0A0A] to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
          <div className="max-w-2xl">
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">
              WEST RYDE &middot; KELLYVILLE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              WEEKLY
              <br />
              <span className="text-[#7E57C2]">TRAINING</span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
              Junior volleyball for every level, beginner to advanced. We group players by ability
              and coach each one at the right level, across Sydney.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedBookingLink
                location="term_programs_hero"
                tier="general"
                href="/booking/trial"
                className="inline-block bg-[#5E35A8] text-white font-heading text-xl sm:text-2xl px-9 py-4 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide glow-purple text-center"
              >
                BOOK A TRIAL
              </TrackedBookingLink>
              <TrackedBookingLink
                location="term_programs_hero"
                tier="term_program"
                href="/booking/term/junior"
                className="inline-block border border-white/20 text-white font-heading text-xl sm:text-2xl px-9 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide text-center"
              >
                ENROL IN TERM
              </TrackedBookingLink>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Three levels (curriculum) */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A] border-t border-white/[0.06]">
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

      {/* 2. Coached at the right level */}
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
                <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">HOW WE COACH</p>
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

      {/* 3. How it works — a $25 trial class first, then enrol for the term. */}
      <section className="py-16 lg:py-20 bg-[#0A0A0A] border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-10">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">NEW HERE?</p>
              <h2 className="font-heading text-4xl sm:text-5xl text-white tracking-wide">
                HOW IT <span className="text-[#7E57C2]">WORKS</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { n: "01", h: "Book a trial", b: "Try a class for $25 and see if it's the right fit." },
              { n: "02", h: "Enrol for the term", b: "Love it? Enrol and pay for the rest of the term." },
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
          <SectionReveal>
            <p className="text-gray-300 text-base leading-relaxed max-w-3xl border-l-2 border-[#7E57C2]/50 pl-5">
              New to Obsidian? Start with a $25 trial class. If your child loves it, enrol for the
              rest of the term. Simple.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* 4. Flat timetable — every session, straight from the DB */}
      <SessionTable programs={programs} />

      {/* 5. Coaches + philosophy */}
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

      {/* 6. Locations — Google Maps, no photos */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">WHERE WE TRAIN</p>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                OUR <span className="text-[#7E57C2]">LOCATIONS</span>
              </h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
            {/* West Ryde */}
            <SectionReveal>
              <div className="h-full border border-white/[0.08] bg-[#111] overflow-hidden flex flex-col">
                <div className="aspect-[16/9] bg-[#0A0A0A]">
                  <iframe
                    src="https://www.google.com/maps?q=Obsidian+Volleyball+Academy+West+Ryde&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: MAP_FILTER }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Obsidian Volleyball Academy West Ryde location"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] uppercase mb-2">Term classes</p>
                  <h3 className="font-heading text-2xl text-white tracking-wide mb-2">Obsidian Volleyball Academy West Ryde</h3>
                  <p className="text-gray-500 text-sm mb-4">West Ryde, NSW. Indoor courts, climate controlled, plenty of parking.</p>
                  <a href={WEST_RYDE_MAPS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#7E57C2] hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              </div>
            </SectionReveal>
            {/* Kellyville */}
            <SectionReveal delay={0.15}>
              <div className="h-full border border-white/[0.08] bg-[#111] overflow-hidden flex flex-col">
                <div className="aspect-[16/9] bg-[#0A0A0A]">
                  <iframe
                    src="https://www.google.com/maps?q=Kellyville+High+School&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: MAP_FILTER }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Obsidian Volleyball Academy Kellyville location"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] uppercase mb-2">Term classes</p>
                  <h3 className="font-heading text-2xl text-white tracking-wide mb-2">Obsidian Volleyball Academy Kellyville</h3>
                  <p className="text-gray-500 text-sm mb-4">Kellyville High School, cnr York Road &amp; Queensbury Avenue, Kellyville NSW 2155.</p>
                  <a href={KELLYVILLE_MAPS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#7E57C2] hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
