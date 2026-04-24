import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Term Programs | Weekly Junior Volleyball, Baulkham Hills",
  description:
    "Weekly volleyball term programs for juniors in Baulkham Hills, Hills District Sydney. Train consistently across the school term.",
  keywords: [
    "volleyball term program Baulkham Hills",
    "weekly junior volleyball Sydney",
    "term volleyball coaching Hills District",
  ],
};

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
                Consistent, high-quality volleyball coaching across the school term. More details coming soon.
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

      {/* Placeholder content */}
      <section className="py-20 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: "Weekly Sessions", body: "Train every week with Obsidian coaches at Baulkham Hills High School. Schedule details coming soon." },
                { title: "All Skill Levels", body: "Players are grouped by ability so beginners and advanced juniors both get the right level of challenge." },
                { title: "Term-Length Commitment", body: "Programs run alongside the NSW school term. Pricing and dates will be published ahead of registration." },
              ].map((item) => (
                <div key={item.title}>
                  <h2 className="font-heading text-3xl text-white tracking-wide mb-4">{item.title}</h2>
                  <p className="text-gray-400 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
