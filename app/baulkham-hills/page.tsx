import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title: "Volleyball Coaching Baulkham Hills | Holiday Camps | Obsidian Volleyball Academy",
  description:
    "Junior volleyball holiday camps in Baulkham Hills, Sydney. School-holiday programs at Baulkham Hills High School for ages 8 to 18, all skill levels. Book now.",
  keywords: [
    "volleyball Baulkham Hills",
    "volleyball coaching Baulkham Hills",
    "junior volleyball Baulkham Hills",
    "volleyball camp Baulkham Hills",
    "holiday volleyball Hills District",
    "volleyball Baulkham Hills High School",
    "kids volleyball Hills District",
    "volleyball near me Castle Hill",
  ],
  alternates: { canonical: "/baulkham-hills" },
  openGraph: {
    title: "Volleyball Coaching Baulkham Hills | Holiday Camps",
    description:
      "Junior volleyball holiday camps at Baulkham Hills High School. Ages 8 to 18, all skill levels.",
    images: ["/images/gallery-spike.jpg"],
    url: "/baulkham-hills",
  },
};

const SUBURBS_SERVED = [
  { slug: "baulkham-hills", name: "Baulkham Hills" },
  { slug: "castle-hill", name: "Castle Hill" },
  { slug: "bella-vista", name: "Bella Vista" },
  { slug: "kellyville", name: "Kellyville" },
  { slug: "north-rocks", name: "North Rocks" },
  { slug: "winston-hills", name: "Winston Hills" },
  { slug: "northmead", name: "Northmead" },
];

const venueSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Obsidian Volleyball Academy — Baulkham Hills",
  description:
    "Junior volleyball holiday camps at Baulkham Hills High School. School-holiday programs for ages 8 to 18.",
  url: "https://obsidianvolleyball.com/baulkham-hills",
  image: "https://obsidianvolleyball.com/images/gallery-spike.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Windsor Road",
    addressLocality: "Baulkham Hills",
    addressRegion: "NSW",
    postalCode: "2153",
    addressCountry: "AU",
  },
  areaServed: SUBURBS_SERVED.map((s) => s.name),
  sport: "Volleyball",
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 18,
  },
  parentOrganization: {
    "@type": "SportsOrganization",
    name: "Obsidian Volleyball Academy",
    url: "https://obsidianvolleyball.com",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://obsidianvolleyball.com" },
    { "@type": "ListItem", position: 2, name: "Baulkham Hills", item: "https://obsidianvolleyball.com/baulkham-hills" },
  ],
};

export default function BaulkhamHillsPage() {
  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top left, rgba(123,47,190,0.10) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-16 items-end">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
                  BAULKHAM HILLS &middot; SYDNEY
                </p>
                <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl text-white tracking-wide mb-8 leading-[0.9]">
                  VOLLEYBALL
                  <br />
                  COACHING IN
                  <br />
                  <span className="text-[#9B4FDE]">BAULKHAM HILLS</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-10">
                  School-holiday volleyball camps at Baulkham Hills High School. Three courts,
                  three levels, ages 8 to 18. Five weekdays of structured coaching every
                  holiday period &mdash; or drop in for a single day if that suits your schedule.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <TrackedBookingLink
                    location="baulkham_hills_hero"
                    tier="5_day_pack"
                    className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
                  >
                    BOOK A CAMP
                  </TrackedBookingLink>
                  <Link
                    href="/holiday-camp"
                    className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
                  >
                    CAMP DETAILS
                  </Link>
                </div>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="aspect-[4/5] relative hidden lg:block overflow-hidden">
                <Image
                  src="/images/gallery-spike.jpg"
                  alt="Junior volleyball camp at Baulkham Hills High School"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Long-form copy */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">THE VENUE</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-10">
              HOLIDAY CAMPS AT BHHS
            </h2>
            <div className="space-y-6 text-gray-400 text-base leading-relaxed">
              <p>
                Obsidian Volleyball Academy runs its school-holiday camps at{" "}
                <span className="text-white">Baulkham Hills High School</span> on Windsor
                Road. The school&apos;s indoor sports hall gives us three full volleyball
                courts side by side &mdash; enough capacity to split every camp into three
                ability streams (beginner, intermediate, advanced) and run them in parallel
                so each player is training with kids at their level.
              </p>
              <p>
                Baulkham Hills is the natural hub for junior volleyball in the Hills District.
                Families from Castle Hill, Bella Vista, Kellyville, North Rocks, Winston Hills,
                Northmead, Carlingham, Cherrybrook, and Norwest can reach BHHS in under fifteen
                minutes on most days. There&apos;s free parking on-site at the school for
                drop-off and pick-up, the venue is well-signed once you turn into Windsor
                Road, and the indoor hall keeps sessions running rain, hail, or 38-degree heat.
              </p>
              <p>
                Camps run during NSW public school holidays &mdash; typically a five-day
                Monday-to-Friday block, 9:00&nbsp;AM to 1:00&nbsp;PM. Each day follows the
                same rhythm: check-in and warm-up, technical work on passing, setting and
                serving, a short break, then a longer session on spiking, blocking, and live
                game play before dismissal. Players pick up a noticeable amount across five
                days because they&apos;re practising the same skills daily with coaches
                watching them.
              </p>
              <p>
                Coaches at the Baulkham Hills venue all hold current Working With Children
                Checks, and most have competed at state, NSWCHS, or premier-league level
                themselves. We keep the coach-to-player ratio high so every kid gets real
                feedback instead of being lost in a big group. Parents are welcome to watch.
              </p>
              <p>
                You can book a single day, a half-day morning session, or the full five-day
                package &mdash; the five-day option works out cheapest per day and comes with
                a free Obsidian training jersey. No experience needed for the beginner stream:
                we teach the game from zero. Bring volleyball-suitable shoes, a water bottle,
                and a snack. Spots fill fast each holiday period, so book early.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Schedule snapshot */}
      <section className="py-20 lg:py-24 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">A DAY AT CAMP</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-12">SCHEDULE</h2>
          </SectionReveal>
          <div className="space-y-0">
            {[
              { time: "9:00 AM", title: "Check-in & warm-up" },
              { time: "9:30 AM", title: "Technical drills across three courts (by level)" },
              { time: "11:00 AM", title: "Break" },
              { time: "11:20 AM", title: "Serving, spiking, game play" },
              { time: "1:00 PM", title: "Dismissal" },
            ].map((slot) => (
              <div
                key={slot.time}
                className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 sm:gap-8 py-5 border-b border-white/[0.06]"
              >
                <p className="font-heading text-base sm:text-lg text-[#9B4FDE] tracking-wider pt-1">{slot.time}</p>
                <p className="text-white text-base sm:text-lg">{slot.title}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link
              href="/holiday-camp"
              className="text-[#9B4FDE] text-sm hover:text-white transition-colors"
            >
              See full camp details and pricing &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Address + map */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">FIND US</p>
                <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide mb-8">
                  THE VENUE
                </h2>
                <address className="not-italic space-y-2 mb-6">
                  <p className="text-white text-lg">Baulkham Hills High School</p>
                  <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills</p>
                  <p className="text-gray-500 text-sm">NSW 2153</p>
                </address>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Three indoor courts. Free on-site parking. Central to the entire Hills District.
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Baulkham+Hills+High+School"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors"
                >
                  Get directions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden bg-[#0A0A0A]">
                <iframe
                  src="https://www.google.com/maps?q=Baulkham+Hills+High+School&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Baulkham Hills High School"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Suburbs served */}
      <section className="py-20 lg:py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">SERVING</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-10">
              FAMILIES FROM
            </h2>
            <p className="text-gray-500 text-sm max-w-2xl mb-10 leading-relaxed">
              Baulkham Hills High School sits at the centre of the Hills District. Most of
              the following suburbs are inside fifteen minutes by car.
            </p>
          </SectionReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {SUBURBS_SERVED.map((suburb) => (
              <Link
                key={suburb.slug}
                href={`/areas/${suburb.slug}`}
                className="bg-[#0A0A0A] p-6 lg:p-8 group hover:bg-[#141114] transition-colors duration-500"
              >
                <p className="font-heading text-xl text-white tracking-wide group-hover:text-[#9B4FDE] transition-colors duration-300">
                  {suburb.name.toUpperCase()}
                </p>
                <p className="text-gray-600 text-xs mt-2">Volleyball coaching for {suburb.name} families &rarr;</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">SCHOOL HOLIDAYS</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK A
              <br />
              <span className="text-[#9B4FDE]">CAMP</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Camps fill quickly each holiday period. Reserve a single day, a half-day, or
              the full five-day pack.
            </p>
            <TrackedBookingLink
              location="baulkham_hills_cta"
              tier="5_day_pack"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </TrackedBookingLink>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              BAULKHAM HILLS HIGH SCHOOL &middot; AGES 8&ndash;18 &middot; ALL LEVELS
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
