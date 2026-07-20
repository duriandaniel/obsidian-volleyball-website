import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import TrackPixelView from "@/components/TrackPixelView";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title: "Adult Volleyball West Ryde | Scrims & Men's Squad",
  description:
    "Adult volleyball at Obsidian Volleyball Academy West Ryde. Drop in to open social scrims Friday 7 to 9 PM for $20 a night, or trial for the Men's Development Squad.",
  keywords: [
    "adult volleyball Sydney",
    "adult volleyball West Ryde",
    "volleyball scrim Sydney",
    "open volleyball scrim Sydney",
    "social volleyball Sydney",
    "adult volleyball drop in Sydney",
    "men's volleyball squad Sydney",
    "Obsidian Volleyball Academy West Ryde",
  ],
  alternates: { canonical: "/adult-sessions" },
  openGraph: {
    title: "Adult Volleyball | West Ryde Sydney",
    description:
      "Open social scrims and the Men's Development Squad at Obsidian Volleyball Academy West Ryde. All skill levels welcome.",
    images: ["/images/og-adult.jpg"],
    url: "/adult-sessions",
  },
};

// On-site booking funnel, deep-linked straight to each flow.
const SCRIM_BOOKING_URL = "/booking/adult/scrim";
const MENS_INFO_URL = "/mens-squad";
const MENS_BOOKING_URL = "/booking/mens-squad";
const MAPS_URL = "https://maps.app.goo.gl/eByotpKjs2mcs4AL8";

export default function AdultSessionsPage() {
  return (
    <div className="pt-20">
      <TrackPixelView contentName="adult_sessions" contentCategory="program" />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">18+ &middot; WEST RYDE</p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              ADULT
              <br />
              <span className="text-[#7E57C2]">VOLLEYBALL</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed">
              Two ways to play at West Ryde. Trial for a spot in our new Men&apos;s Development Squad, or drop in to an
              open social scrim on Friday nights.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Men's Development Squad */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">NEW &middot; WINTER &apos;26 BATCH</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95] mb-6">
              MEN&apos;S DEVELOPMENT
              <br />
              <span className="text-[#7E57C2]">SQUAD</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed mb-3">
              Our men&apos;s development program. Trial for a spot, then train an 8 week coached squad building toward a
              representative team.
            </p>
            <p className="text-gray-500 text-sm max-w-xl mb-10">
              Trial nights are $15, 16+, Friday 7 to 9 PM. The squad is picked from the trial and spots are limited.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <TrackedBookingLink
                href={MENS_BOOKING_URL}
                location="mens_squad_cta"
                className="inline-block bg-[#5E35A8] text-white font-heading text-xl sm:text-2xl px-10 py-4 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide glow-purple"
              >
                TRIAL FOR YOUR SPOT
              </TrackedBookingLink>
              <Link
                href={MENS_INFO_URL}
                className="inline-flex items-center gap-2 text-[#7E57C2] hover:text-white font-heading text-sm tracking-[0.15em] uppercase transition-colors"
              >
                Read more <span aria-hidden>→</span>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Social scrims */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">DROP IN</p>
            <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95] mb-6">
              SOCIAL SCRIMS
            </h2>
            <p className="text-gray-300 text-lg max-w-xl leading-relaxed mb-3">
              Open scrims every Friday, 7 to 9 PM. Turn up any week for{" "}
              <span className="text-white">$20</span>. All skill levels welcome.
            </p>
            <p className="text-gray-500 text-sm max-w-xl mb-10">Three teams, sets to 15.</p>
            <TrackedBookingLink
              href={SCRIM_BOOKING_URL}
              location="adult_open_cta"
              className="inline-block bg-[#5E35A8] text-white font-heading text-xl sm:text-2xl px-10 py-4 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK A SCRIM
            </TrackedBookingLink>
          </SectionReveal>
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
                <p className="text-gray-400 text-base leading-relaxed mb-5">
                  State-of-the-art indoor volleyball courts in West Ryde, climate-controlled, plenty of parking.
                  Sessions run rain or shine.
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
