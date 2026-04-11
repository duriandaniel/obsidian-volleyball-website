import type { Metadata } from "next";
import CoachCard from "@/components/CoachCard";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Volleyball Coaches | Baulkham Hills, Hills District Sydney",
  description:
    "Meet the OVA coaching team. Volleyball NSW accredited coaches based in Baulkham Hills, Hills District. Expert junior volleyball coaching.",
  keywords: [
    "volleyball coaching Baulkham Hills",
    "volleyball coach Hills District",
    "volleyball NSW accredited coach Sydney",
  ],
};

const coaches = [
  {
    name: "Melinda",
    role: "Head Coach & Co-Founder",
    bio: "Melinda founded OVA in 2025 after years of competitive volleyball and a frustration that Hills District juniors had to travel for quality coaching. Her approach combines technical rigour with a supportive, athlete-centred environment. Specialises in beginner and intermediate development.",
    qualifications: [
      "Volleyball NSW Accredited Coach",
      "First Aid Certified (HLTAID011)",
      "Working With Children Check (NSW)",
      "Junior Development Specialist",
    ],
  },
  {
    name: "Jessica",
    role: "Lead Coach",
    bio: "Jessica's competitive playing background and natural ability to connect with young athletes makes her invaluable. Sharp eye for technique and a knack for breaking complex skills into learnable steps. Leads intermediate and advanced sessions.",
    qualifications: [
      "Volleyball NSW Accredited Coach",
      "First Aid Certified (HLTAID011)",
      "Working With Children Check (NSW)",
      "Competition Coaching Experience",
    ],
  },
];

const values = [
  {
    title: "ATHLETE-FIRST",
    desc: "Every decision — from drills to session pacing — is made with the athlete's development and enjoyment in mind.",
  },
  {
    title: "TECHNICAL EXCELLENCE",
    desc: "We don't cut corners on technique. Correct fundamentals at a young age set players up for success at every level.",
  },
  {
    title: "SAFE & INCLUSIVE",
    desc: "All coaches hold current WWCC and First Aid certifications. OVA is a safe, welcoming environment for every junior.",
  },
  {
    title: "PATHWAY FOCUSED",
    desc: "Aligned with Volleyball NSW pathways so advanced players can transition to club and representative volleyball.",
  },
];

export default function CoachesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-6">WORLD-CLASS INSTRUCTION</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              MEET THE
              <br />
              <span className="text-[#00FF88]">COACHES</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
              Volleyball NSW accredited professionals who combine competitive
              experience with a genuine passion for junior development.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Coach Cards */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 max-w-4xl">
            {coaches.map((coach, i) => (
              <CoachCard key={coach.name} {...coach} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">HOW WE COACH</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PHILOSOPHY</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.04]">
            {values.map((v, i) => (
              <SectionReveal key={v.title} delay={i * 0.05}>
                <div className="bg-[#0A0A0A] p-8 lg:p-10 group hover:bg-[#111] transition-colors duration-500">
                  <h3 className="font-heading text-2xl text-[#00FF88] tracking-wide mb-4 group-hover:text-white transition-colors duration-300">
                    {v.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Volleyball NSW */}
      <section className="py-16 lg:py-20 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
              <div className="max-w-xl">
                <p className="text-[#00FF88] font-heading text-xs tracking-[0.4em] mb-3">ACCREDITATION</p>
                <h2 className="font-heading text-3xl text-white tracking-wide mb-3">
                  VOLLEYBALL NSW AFFILIATED
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  All coaches hold current Volleyball NSW accreditation. Coaching
                  standards, drills, and player pathways align with the peak body for volleyball in NSW.
                </p>
              </div>
              <a
                href="https://volleyballnsw.org.au"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#00FF88] font-heading text-base tracking-wide hover:text-white transition-colors duration-300 flex-shrink-0"
              >
                VISIT VOLLEYBALL NSW
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] text-center">
        <div className="section-divider absolute left-0 right-0" />
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-4">TRAIN WITH THE BEST</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK A
              <br />
              <span className="text-[#00FF88]">SESSION</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#00FF88] text-black font-heading text-2xl px-10 py-4 hover:bg-white transition-all duration-300 tracking-wide glow-green"
              >
                BOOK NOW
              </a>
              <Link
                href="/contact"
                className="border border-white/20 text-white font-heading text-2xl px-10 py-4 hover:border-[#00FF88] hover:text-[#00FF88] transition-all duration-300 tracking-wide"
              >
                CONTACT US
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
