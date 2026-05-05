import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import TrackPixelView from "@/components/TrackPixelView";

export const metadata: Metadata = {
  title:
    "Adult Sessions | Friday Volleyball Scrims | West Ryde Sydney | Obsidian",
  description:
    "Casual adult volleyball scrims every Friday 8 to 10 PM at Bennelong Sports Centre, West Ryde. Two indoor courts, all skill levels, weekly during the school term.",
  keywords: [
    "adult volleyball Sydney",
    "adult volleyball West Ryde",
    "volleyball scrim Sydney",
    "social volleyball Sydney",
    "adult volleyball drop in Sydney",
    "Friday volleyball West Ryde",
  ],
  alternates: { canonical: "/adult-sessions" },
  openGraph: {
    title: "Adult Sessions | Friday Volleyball Scrims | West Ryde Sydney",
    description:
      "Casual adult volleyball scrims every Friday 8 to 10 PM at Bennelong Sports Centre, West Ryde.",
    images: ["/images/bennelong-courtyard.png"],
    url: "/adult-sessions",
  },
};

const ENROL_PLACEHOLDER = "/contact";

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
              Casual scrimmage volleyball for adults at Bennelong Sports Centre.
              Both courts running, open to all skill levels. Weekly during the
              school term.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Big offering card */}
      <section className="py-12 lg:py-16 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="border border-white/[0.06] bg-[#0F0F0F] hover:border-[#9B4FDE]/40 transition-colors duration-500">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-px bg-white/[0.04]">
                {/* Left: details */}
                <div className="bg-[#0F0F0F] p-8 lg:p-12">
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.4em] uppercase mb-4">
                    Bennelong Sports Centre &middot; West Ryde
                  </p>

                  <div className="flex items-baseline gap-3 sm:gap-5 mb-6 flex-wrap">
                    <span className="font-heading text-xl sm:text-2xl lg:text-3xl text-white tracking-[0.2em] uppercase">
                      Friday
                    </span>
                    <span className="hidden sm:inline-block w-px h-7 bg-[#9B4FDE]/40" />
                    <span className="font-heading text-xl sm:text-2xl lg:text-3xl text-[#9B4FDE] tracking-wider">
                      8:00 &ndash; 10:00 PM
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="font-heading text-4xl lg:text-5xl text-[#9B4FDE]">$20</span>
                    <span className="text-gray-500 text-sm">per person</span>
                  </div>

                  <ul className="space-y-3 mb-10 text-gray-300 text-sm lg:text-base">
                    <li className="flex items-start gap-3">
                      <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                      <span>Two indoor courts running in parallel.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                      <span>Open to adults at any skill level.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                      <span>Casual scrimmage format. Show up, get on court, play.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                      <span>Two-hour block, weekly during school terms.</span>
                    </li>
                  </ul>

                  <Link
                    href={ENROL_PLACEHOLDER}
                    className="inline-flex items-center gap-2 bg-[#7B2FBE] text-white font-heading text-sm tracking-[0.2em] uppercase px-7 py-3 hover:bg-white hover:text-[#7B2FBE] transition-all duration-300 glow-purple"
                  >
                    <span>Book a Spot</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Right: details panel */}
                <div className="bg-[#0A0A0A] p-8 lg:p-12 flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 font-heading text-xs tracking-[0.3em] uppercase mb-3">
                      What to expect
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                      Adult scrims are a chill way to get court time, meet other
                      Sydney players, and stay sharp. Skill is mixed; teams are
                      balanced on the night.
                    </p>

                    <p className="text-gray-600 font-heading text-xs tracking-[0.3em] uppercase mb-3">
                      What to bring
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Indoor court shoes (clean, non-marking), water, a friend if
                      you have one. Knee pads optional.
                    </p>
                  </div>

                  <p className="text-gray-700 text-[10px] tracking-wider mt-8">
                    SAME VENUE AS JUNIOR CLASSES
                  </p>
                </div>
              </div>
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
              FRIDAY NIGHTS
            </p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              GET ON
              <br />
              <span className="text-[#9B4FDE]">COURT</span>
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Book in for the next Friday scrim and we&apos;ll see you there.
            </p>
            <Link
              href={ENROL_PLACEHOLDER}
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK A SPOT
            </Link>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              BENNELONG SPORTS CENTRE &middot; WEST RYDE &middot; ADULT SCRIMS
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
