import type { Metadata } from "next";
import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import TrackPixelView from "@/components/TrackPixelView";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title:
    "Adult Sessions | Open Volleyball Scrims | West Ryde Sydney | Obsidian",
  description:
    "Adult open volleyball scrims every Friday 7 to 9 PM at Bennelong Sports Centre, West Ryde. Two courts, all skill levels welcome.",
  keywords: [
    "adult volleyball Sydney",
    "adult volleyball West Ryde",
    "volleyball scrim Sydney",
    "open volleyball scrim Sydney",
    "social volleyball Sydney",
    "adult volleyball drop in Sydney",
    "Friday volleyball West Ryde",
  ],
  alternates: { canonical: "/adult-sessions" },
  openGraph: {
    title: "Adult Sessions | Open Volleyball Scrims | West Ryde Sydney",
    description:
      "Adult open volleyball scrims every Friday 7 to 9 PM at Bennelong Sports Centre. Two courts, all skill levels welcome.",
    images: ["/images/bennelong-courtyard.png"],
    url: "/adult-sessions",
  },
};

const ACUITY_ADULT_URL =
  "https://obsidianvolleyball.as.me/schedule/c027025f/category/Adult%20Sessions";

export default function AdultSessionsPage() {
  return (
    <div className="pt-20">
      <TrackPixelView contentName="adult_sessions" contentCategory="program" />

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              FRIDAY NIGHTS &middot; WEST RYDE
            </p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-6 leading-[0.9]">
              ADULT
              <br />
              <span className="text-[#9B4FDE]">SESSIONS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
              Adult open scrims every Friday at Bennelong Sports Centre. Two
              courts, all skill levels welcome. Pick a Friday and book a spot.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Open scrim card */}
      <section className="py-12 lg:py-16 bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="border border-white/[0.06] bg-[#0F0F0F] hover:border-[#9B4FDE]/40 transition-colors duration-500 h-full flex flex-col p-8 lg:p-10">
              <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.4em] uppercase mb-3">
                Format
              </p>
              <h2 className="font-heading text-3xl lg:text-4xl text-white tracking-wide mb-6">
                OPEN SCRIM
              </h2>

              <div className="flex items-baseline gap-3 sm:gap-4 mb-4 flex-wrap">
                <span className="font-heading text-lg sm:text-xl text-white tracking-[0.2em] uppercase">
                  Friday
                </span>
                <span className="hidden sm:inline-block w-px h-5 bg-[#9B4FDE]/40" />
                <span className="font-heading text-lg sm:text-xl text-[#9B4FDE] tracking-wider">
                  7:00 &ndash; 9:00 PM
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-heading text-3xl lg:text-4xl text-[#9B4FDE]">$20</span>
                <span className="text-gray-500 text-sm">per person</span>
              </div>

              <ul className="space-y-3 mb-8 text-gray-300 text-sm flex-1">
                <li className="flex items-start gap-3">
                  <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                  <span>Open to adults at any skill level.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                  <span>2 courts, capacity 21 per court.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                  <span>3 teams per court.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                  <span>Sets to 15 points.</span>
                </li>
              </ul>

              <TrackedBookingLink
                href={ACUITY_ADULT_URL}
                location="adult_open_cta"
                className="inline-flex items-center justify-center gap-2 bg-[#7B2FBE] text-white font-heading text-sm tracking-[0.2em] uppercase px-7 py-3.5 hover:bg-white hover:text-[#7B2FBE] transition-all duration-300 glow-purple"
              >
                <span>Book a Spot</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </TrackedBookingLink>
            </div>
          </SectionReveal>
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
                  State-of-the-art indoor volleyball courts in West Ryde,
                  climate-controlled, plenty of parking. Sessions run rain or shine.
                </p>
                <p className="text-gray-500 text-sm">
                  Bennelong Sports Centre &middot; West Ryde, NSW
                </p>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
