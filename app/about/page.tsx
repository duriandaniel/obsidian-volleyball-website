import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Obsidian Volleyball Academy | Hills District Sydney",
  description:
    "Learn about Obsidian Volleyball Academy — a premium junior volleyball academy in Baulkham Hills, Hills District Sydney. Founded 2025. Volleyball NSW affiliated.",
};

const timeline = [
  { year: "2025", event: "Obsidian Volleyball Academy founded in Baulkham Hills" },
  { year: "2025", event: "First holiday camp — sold out in 2 weeks" },
  { year: "2025", event: "Volleyball NSW affiliation secured" },
  { year: "2026", event: "Term programs launched for all skill levels" },
  { year: "2026", event: "Expanded coaching team and multi-court operations" },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">OUR STORY</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              BUILT FOR
              <br />
              <span className="text-[#9B4FDE]">THE HILLS</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
              Obsidian Volleyball Academy exists because Hills District juniors
              deserved better access to quality volleyball coaching — without
              travelling across Sydney.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-16 lg:gap-24">
            <SectionReveal>
              <div className="photo-placeholder aspect-[4/5] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-700 text-xs tracking-wider">FOUNDER PHOTO</span>
                </div>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.1}>
              <div className="flex flex-col justify-center">
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">THE ORIGIN</p>
                <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-8">WHY OVA EXISTS</h2>
                <div className="space-y-5 text-gray-400 leading-relaxed">
                  <p>
                    Dan founded Obsidian Volleyball Academy in 2025 after seeing firsthand how
                    difficult it was for talented junior players in the Hills District to access
                    quality volleyball coaching.
                  </p>
                  <p>
                    The options were limited: travel across Sydney for a good program, or settle
                    for inconsistent local coaching. Neither was good enough.
                  </p>
                  <p>
                    OVA was built to solve that problem. By partnering with Volleyball NSW and
                    securing a permanent venue at Baulkham Hills High School, Dan created
                    an academy that brings state-level coaching standards to the Hills District.
                  </p>
                  <p>
                    Today, OVA runs holiday camps and term programs for juniors aged 8 to 18,
                    with coaches who have competitive playing experience and a genuine passion
                    for developing the next generation of volleyball players.
                  </p>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">OUR MISSION</p>
            <blockquote className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide leading-tight mb-8">
              &ldquo;MAKE ELITE VOLLEYBALL
              <br />
              <span className="text-[#9B4FDE]">ACCESSIBLE</span> TO EVERY
              <br />
              JUNIOR IN THE
              <br />
              HILLS DISTRICT.&rdquo;
            </blockquote>
          </SectionReveal>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">THE JOURNEY</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">TIMELINE</h2>
            </div>
          </SectionReveal>
          <div className="space-y-0">
            {timeline.map((item, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <div className="flex gap-8 py-6 border-b border-white/[0.06] group">
                  <span className="font-heading text-2xl text-[#9B4FDE] w-16 flex-shrink-0">{item.year}</span>
                  <p className="text-gray-400 text-sm leading-relaxed pt-1 group-hover:text-white transition-colors duration-300">
                    {item.event}
                  </p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">WHAT DRIVES US</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">VALUES</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
            {[
              {
                title: "EXCELLENCE",
                desc: "We don't cut corners. Every session, every drill, every interaction reflects a commitment to the highest standard.",
              },
              {
                title: "ACCESSIBILITY",
                desc: "Elite coaching shouldn't require a long commute. OVA brings quality training to the Hills District — and accepts Active Kids Vouchers.",
              },
              {
                title: "DEVELOPMENT",
                desc: "We develop players, not just skills. Confidence, resilience, teamwork — these matter as much as technique.",
              },
            ].map((value) => (
              <SectionReveal key={value.title}>
                <div className="bg-[#0A0A0A] p-8 lg:p-12">
                  <h3 className="font-heading text-2xl text-[#9B4FDE] tracking-wide mb-4">{value.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">JOIN THE ACADEMY</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BECOME PART
              <br />
              OF <span className="text-[#9B4FDE]">OVA</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#7B2FBE] text-white font-heading text-2xl px-10 py-4 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
              >
                BOOK NOW
              </a>
              <Link
                href="/coaches"
                className="border border-white/20 text-white font-heading text-2xl px-10 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide"
              >
                MEET COACHES
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
