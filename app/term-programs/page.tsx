import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Term Programs | Weekly Junior Volleyball, Sydney",
  description:
    "Weekly volleyball term programs for juniors across Sydney's Hills District and Upper North Shore. Train consistently across the school term.",
  keywords: [
    "volleyball term program Baulkham Hills",
    "volleyball term program Kellyville",
    "volleyball term program St Ives",
    "weekly junior volleyball Sydney",
  ],
};

const locations = [
  {
    name: "Baulkham Hills High School",
    address: "Windsor Road, Baulkham Hills NSW 2153",
    day: "Saturday",
    time: "9:00 – 11:00 AM",
    levels: "All levels (beginner to advanced)",
    mapsQuery: "Obsidian+Volleyball+Academy",
  },
  {
    name: "Kellyville High School",
    address: "York Road, Kellyville NSW 2155",
    day: "Tuesday",
    time: "5:00 – 7:00 PM",
    levels: "Beginner and intermediate",
    mapsQuery: "Kellyville+High+School",
  },
  {
    name: "St Ives Recreational Centre",
    address: "St Ives NSW 2075",
    day: "Thursday",
    time: "5:00 – 7:00 PM",
    levels: "Intermediate and advanced",
    mapsQuery: "St+Ives+Recreation+Centre",
  },
];

export default function TermProgramsPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="max-w-3xl">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">WEEKLY TRAINING</p>
              <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
                TERM
                <br />
                <span className="text-[#9B4FDE]">PROGRAMS</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed">
                Consistent, high-quality volleyball coaching across the school term. Multiple locations and times across Sydney.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <TrackedBookingLink
                  location="term_programs_hero"
                  className="bg-[#7B2FBE] text-white font-heading text-2xl px-10 py-4 hover:bg-[#9B4FDE] transition-all duration-300 tracking-wide text-center glow-purple"
                >
                  REGISTER INTEREST
                </TrackedBookingLink>
                <Link
                  href="/contact"
                  className="border border-white/20 text-white font-heading text-2xl px-10 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
                >
                  CONTACT US
                </Link>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Locations & Times */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">WHEN AND WHERE</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide">LOCATIONS &amp; TIMES</h2>
              <p className="text-gray-500 text-sm mt-4">Indicative schedule. Confirmed timetable will be published before term starts.</p>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
            {locations.map((loc, i) => (
              <SectionReveal key={loc.name} delay={i * 0.05}>
                <div className="bg-[#111] p-8 lg:p-10 h-full flex flex-col">
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">{loc.day.toUpperCase()}</p>
                  <h3 className="font-heading text-2xl lg:text-3xl text-white tracking-wide mb-2">{loc.name}</h3>
                  <p className="text-gray-500 text-sm mb-5">{loc.address}</p>
                  <div className="border-t border-white/[0.06] pt-5 space-y-2 mb-6">
                    <p className="text-gray-300 text-sm">
                      <span className="text-gray-600 text-xs tracking-wider mr-2">TIME</span>
                      {loc.time}
                    </p>
                    <p className="text-gray-300 text-sm">
                      <span className="text-gray-600 text-xs tracking-wider mr-2">LEVELS</span>
                      {loc.levels}
                    </p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors"
                  >
                    View on Google Maps
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* What to expect */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">WHAT TO EXPECT</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide">HOW IT WORKS</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: "Weekly Sessions", body: "Train every week with Obsidian coaches across the school term. Two-hour sessions focused on skill-building and match play." },
              { title: "All Skill Levels", body: "Players are grouped by ability so beginners and advanced juniors both get the right level of challenge." },
              { title: "Term Commitment", body: "Programs run alongside the NSW school term. Pricing and exact dates published ahead of registration each term." },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-heading text-2xl text-white tracking-wide mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">JOIN THE TERM</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              REGISTER
              <br />
              <span className="text-[#9B4FDE]">YOUR INTEREST</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <TrackedBookingLink
                location="term_programs_hero"
                className="inline-block bg-[#7B2FBE] text-white font-heading text-2xl px-10 py-4 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
              >
                REGISTER NOW
              </TrackedBookingLink>
              <Link
                href="/contact"
                className="border border-white/20 text-white font-heading text-2xl px-10 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide"
              >
                ASK A QUESTION
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
