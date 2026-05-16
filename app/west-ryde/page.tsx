import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title: "Volleyball Coaching West Ryde | Bennelong Sports Centre | Obsidian Volleyball Academy",
  description:
    "Junior volleyball coaching in West Ryde, Sydney. Friday evening term programs at Bennelong Sports Centre for ages 8 to 18, all skill levels. Book now.",
  keywords: [
    "volleyball West Ryde",
    "volleyball coaching West Ryde",
    "junior volleyball West Ryde",
    "kids volleyball West Ryde",
    "volleyball Bennelong Sports Centre",
    "volleyball lessons West Ryde",
    "volleyball academy West Ryde",
    "volleyball near me Ryde",
  ],
  alternates: { canonical: "/west-ryde" },
  openGraph: {
    title: "Volleyball Coaching West Ryde | Bennelong Sports Centre",
    description:
      "Junior volleyball coaching in West Ryde at Bennelong Sports Centre. Friday term programs for ages 8 to 18.",
    images: ["/images/gallery-spike.jpg"],
    url: "/west-ryde",
  },
};

const SUBURBS_SERVED = [
  { slug: "ryde", name: "Ryde" },
  { slug: "eastwood", name: "Eastwood" },
  { slug: "meadowbank", name: "Meadowbank" },
  { slug: "denistone", name: "Denistone" },
  { slug: "top-ryde", name: "Top Ryde" },
  { slug: "putney", name: "Putney" },
  { slug: "north-ryde", name: "North Ryde" },
  { slug: "marsfield", name: "Marsfield" },
  { slug: "macquarie-park", name: "Macquarie Park" },
];

const ACUITY_TERM_CATEGORY =
  "https://obsidianvolleyball.as.me/?appointmentType=category:Weekly%20Training";

const venueSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Obsidian Volleyball Academy — West Ryde",
  description:
    "Junior volleyball coaching at Bennelong Sports Centre, West Ryde. Friday evening term programs for ages 8 to 18.",
  url: "https://obsidianvolleyball.com/west-ryde",
  image: "https://obsidianvolleyball.com/images/gallery-spike.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bennelong Sports Centre",
    addressLocality: "West Ryde",
    addressRegion: "NSW",
    postalCode: "2114",
    addressCountry: "AU",
  },
  areaServed: SUBURBS_SERVED.map((s) => s.name).concat(["West Ryde"]),
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
    { "@type": "ListItem", position: 2, name: "West Ryde", item: "https://obsidianvolleyball.com/west-ryde" },
  ],
};

export default function WestRydePage() {
  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top right, rgba(123,47,190,0.10) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-16 items-end">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
                  WEST RYDE &middot; SYDNEY
                </p>
                <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl text-white tracking-wide mb-8 leading-[0.9]">
                  VOLLEYBALL
                  <br />
                  COACHING IN
                  <br />
                  <span className="text-[#9B4FDE]">WEST RYDE</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-10">
                  Premium junior volleyball at Bennelong Sports Centre. Friday evening term
                  programs for ages 8 to 18, every skill level from first-time beginner to
                  advanced club player. Two indoor courts, four classes a week, expert coaches.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <TrackedBookingLink
                    location="west_ryde_hero"
                    tier="term_program"
                    href={ACUITY_TERM_CATEGORY}
                    className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
                  >
                    BOOK A CLASS
                  </TrackedBookingLink>
                  <Link
                    href="/term-programs"
                    className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
                  >
                    VIEW SCHEDULE
                  </Link>
                </div>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="aspect-[4/5] relative hidden lg:block overflow-hidden">
                <Image
                  src="/images/gallery-spike.jpg"
                  alt="Junior volleyball coaching at Bennelong Sports Centre, West Ryde"
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

      {/* Why West Ryde — long-form copy */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">THE VENUE</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-10">
              FRIDAY NIGHTS AT BENNELONG
            </h2>
            <div className="space-y-6 text-gray-400 text-base leading-relaxed">
              <p>
                Obsidian Volleyball Academy runs its term programs at{" "}
                <span className="text-white">Bennelong Sports Centre, West Ryde</span> — a
                purpose-built indoor sports facility in the heart of the Ryde local government
                area. The venue gives us two full-sized volleyball courts side by side, which
                means we can run two streams in parallel and group players by ability instead
                of forcing mixed-level training that holds everyone back.
              </p>
              <p>
                West Ryde sits in a sweet spot for Sydney&apos;s inner north-west. Families
                from Ryde, Eastwood, Meadowbank, Denistone, Top Ryde, Putney, Gladesville,
                North Ryde, Marsfield, and Macquarie Park can all reach Bennelong inside
                ten minutes by car, and the venue is a short walk from West Ryde train
                station for older players coming on their own. Plenty of on-site and street
                parking means drop-off and pick-up never turn into a stressful scramble.
              </p>
              <p>
                Term classes run every Friday evening, with the early slot at 4:00&nbsp;PM
                and the later slot at 5:30&nbsp;PM. Beginner and intermediate streams sit
                in the earlier block; intermediate and advanced sit in the later block. Each
                class is ninety minutes of structured coaching — warm-up, technical drills,
                positional work, then live game play. We cap groups so the coach-to-player
                ratio stays high and every player gets meaningful reps, not just time on the
                bench.
              </p>
              <p>
                Coaches at the West Ryde venue are accredited and have current Working With
                Children Checks. Most have played at the state or premier league level
                themselves, and they bring that perspective into every session. Parents are
                welcome to watch from the side. We don&apos;t compete on price — we compete
                on the quality of coaching your kid gets between 4:00 and 7:00&nbsp;PM on a
                Friday.
              </p>
              <p>
                Whether your child has never touched a volleyball or is already playing club
                competition like YSVL, there&apos;s a stream for them. Bring volleyball-suitable
                shoes, a water bottle, and a willingness to learn. We take care of the rest.
              </p>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Schedule snapshot */}
      <section className="py-20 lg:py-24 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">EVERY FRIDAY</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-12">SCHEDULE</h2>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04]">
            <div className="bg-[#0A0A0A] p-8 lg:p-10">
              <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">EARLY SLOT</p>
              <p className="font-heading text-3xl text-white mb-4 tracking-wide">4:00 &ndash; 5:30 PM</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Court 1 &mdash; Beginner</li>
                <li>Court 2 &mdash; Intermediate</li>
              </ul>
            </div>
            <div className="bg-[#0A0A0A] p-8 lg:p-10">
              <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">LATE SLOT</p>
              <p className="font-heading text-3xl text-white mb-4 tracking-wide">5:30 &ndash; 7:00 PM</p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Court 1 &mdash; Intermediate</li>
                <li>Court 2 &mdash; Advanced</li>
              </ul>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/term-programs"
              className="text-[#9B4FDE] text-sm hover:text-white transition-colors"
            >
              See per-class details and book your spot &rarr;
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
                  <p className="text-white text-lg">Bennelong Sports Centre</p>
                  <p className="text-gray-500 text-sm">West Ryde, NSW 2114</p>
                </address>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Two indoor volleyball courts. On-site parking. Short walk from West Ryde
                  station. Sessions run rain or shine.
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Bennelong+Sports+Centre+West+Ryde"
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
                  src="https://www.google.com/maps?q=Bennelong+Sports+Centre+West+Ryde&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bennelong Sports Centre, West Ryde"
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
              West Ryde sits at the centre of Sydney&apos;s inner north-west. Most of the
              following suburbs are inside a ten-minute drive of Bennelong.
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
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">FRIDAY EVENINGS</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK A
              <br />
              <span className="text-[#9B4FDE]">CLASS</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Classes fill fast. Reserve a spot in beginner, intermediate, or advanced.
            </p>
            <TrackedBookingLink
              location="west_ryde_cta"
              tier="term_program"
              href={ACUITY_TERM_CATEGORY}
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </TrackedBookingLink>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              BENNELONG SPORTS CENTRE &middot; WEST RYDE &middot; AGES 8&ndash;18
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
