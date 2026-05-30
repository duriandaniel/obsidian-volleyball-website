import type { Metadata } from "next";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import TrackPixelView from "@/components/TrackPixelView";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title: "Adult Sessions | Open Volleyball Scrims | West Ryde Sydney | Obsidian",
  description:
    "Adult open volleyball scrims Tuesday, Wednesday and Friday 7 to 9 PM at Obsidian Volleyball Academy West Ryde. Drop in any night, all skill levels, $20 per night.",
  keywords: [
    "adult volleyball Sydney",
    "adult volleyball West Ryde",
    "volleyball scrim Sydney",
    "open volleyball scrim Sydney",
    "social volleyball Sydney",
    "adult volleyball drop in Sydney",
    "Obsidian Volleyball Academy West Ryde",
  ],
  alternates: { canonical: "/adult-sessions" },
  openGraph: {
    title: "Adult Sessions | Open Volleyball Scrims | West Ryde Sydney",
    description:
      "Adult open volleyball scrims Tuesday, Wednesday and Friday 7 to 9 PM at Obsidian Volleyball Academy West Ryde. Drop in, all skill levels welcome.",
    images: ["/images/bennelong-courtyard.png"],
    url: "/adult-sessions",
  },
};

// On-site booking funnel, deep-linked straight to the adult drop-in flow.
const BOOKING_ADULT_URL = "/booking/adult";
const MAPS_URL = "https://maps.app.goo.gl/eByotpKjs2mcs4AL8";

export default function AdultSessionsPage() {
  return (
    <div className="pt-20">
      <TrackPixelView contentName="adult_sessions" contentCategory="program" />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">
              TUE &middot; WED &middot; FRI &middot; WEST RYDE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              ADULT
              <br />
              <span className="text-[#7E57C2]">SESSIONS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Adult open scrims Tuesday, Wednesday and Friday nights at Obsidian
              Volleyball Academy West Ryde. Two courts, all skill levels welcome.
              Drop in on any night.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Open scrim format — plain panel, no box */}
      <section className="py-12 lg:py-16 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-xs tracking-[0.4em] uppercase mb-3">
              Format
            </p>
            <h2 className="font-heading text-3xl lg:text-4xl text-white tracking-wide mb-6">
              OPEN SCRIM
            </h2>

            <div className="flex items-baseline gap-3 sm:gap-4 mb-4 flex-wrap">
              <span className="font-heading text-lg sm:text-xl text-white tracking-[0.2em] uppercase">
                Tue &middot; Wed &middot; Fri
              </span>
              <span className="hidden sm:inline-block w-px h-5 bg-[#7E57C2]/40" />
              <span className="font-heading text-lg sm:text-xl text-[#7E57C2] tracking-wider">
                7:00 &ndash; 9:00 PM
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-8">
              <span className="font-heading text-3xl lg:text-4xl text-[#7E57C2]">$20</span>
              <span className="text-gray-500 text-sm">per night, drop in</span>
            </div>

            <ul className="space-y-3 mb-8 text-gray-300 text-sm max-w-xl">
              <li className="flex items-start gap-3">
                <span className="text-[#7E57C2] flex-shrink-0 mt-0.5">+</span>
                <span>Open to adults at any skill level.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#7E57C2] flex-shrink-0 mt-0.5">+</span>
                <span>2 courts, capacity 21 per court.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#7E57C2] flex-shrink-0 mt-0.5">+</span>
                <span>3 teams per court.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#7E57C2] flex-shrink-0 mt-0.5">+</span>
                <span>Sets to 15 points.</span>
              </li>
            </ul>

            <TrackedBookingLink
              href={BOOKING_ADULT_URL}
              location="adult_open_cta"
              className="inline-flex items-center justify-center gap-2 bg-[#5E35A8] text-white font-heading text-sm tracking-[0.2em] uppercase px-7 py-3.5 hover:bg-white hover:text-[#5E35A8] transition-all duration-300 glow-purple"
            >
              <span>Book a Spot</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
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
                  State-of-the-art indoor volleyball courts in West Ryde,
                  climate-controlled, plenty of parking. Sessions run rain or shine.
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
