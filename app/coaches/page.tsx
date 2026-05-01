import type { Metadata } from "next";
import CoachCard from "@/components/CoachCard";
import SectionReveal from "@/components/SectionReveal";

export const metadata: Metadata = {
  title: "Volleyball Coaches | Baulkham Hills, Hills District Sydney",
  description:
    "Meet the Obsidian coaching team. Experienced players coaching juniors in Baulkham Hills, Hills District.",
  keywords: [
    "volleyball coaching Baulkham Hills",
    "volleyball coach Hills District",
    "accredited volleyball coach Sydney",
  ],
  alternates: { canonical: "/coaches" },
  openGraph: {
    title: "Volleyball Coaches | Baulkham Hills, Hills District Sydney",
    description:
      "Meet the Obsidian coaching team. Experienced players coaching juniors in Baulkham Hills, Hills District.",
    images: ["/images/coach-instruction.jpg"],
    url: "/coaches",
  },
};

const coaches = [
  {
    name: "Melinda",
    role: "Coach",
    bio: "Melinda combines years of competitive volleyball with a deep commitment to junior development. Her approach blends technical rigour with a supportive, athlete-centred environment. Specialises in beginner and intermediate development.",
    qualifications: [
      "NSWCHS Opens Champion",
      "Sydney West Opens Champion",
      "NSWCHS U16 All Schools",
      "NSW & SW Blues Award",
    ],
    image: "/images/coach-melinda-card.jpg",
  },
  {
    name: "Jessica",
    role: "Coach",
    bio: "Jessica's competitive playing background and natural ability to connect with young athletes makes her invaluable. Sharp eye for technique and a knack for breaking complex skills into learnable steps. Leads intermediate and advanced sessions.",
    qualifications: [
      "u17-18 Phoenix Sky",
      "2x Women Division 1 SVL Champion",
      "2x AYVC Medalist",
      "CHS Champion",
    ],
    image: "/images/coach-jessica-card.jpg",
  },
  {
    name: "Kaveesh",
    role: "Coach",
    bio: "Kaveesh combines years of representative volleyball with a passion for coaching juniors. His energy and technical knowledge make sessions both fun and effective.",
    qualifications: [
      "16s NSWCHS State Team",
      "2022 18s SVL Champions",
      "Sydney West Team (multiple years)",
      "AVSC National Competition 2nd Place",
    ],
    image: "/images/coach-kaveesh-card.jpg",
  },
  {
    name: "Ethan",
    role: "Coach",
    bio: "Ethan brings representative-level experience and a calm, methodical coaching style. He excels at helping players refine technique and build game intelligence.",
    qualifications: [
      "U17 Phoenix Navy",
      "AVSC Silver Medallist",
      "Sydney West Representative",
      "U16 All Schools National Champions",
    ],
    image: "/images/coach-ethan-card.jpg",
  },
];

export default function CoachesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">WORLD-CLASS INSTRUCTION</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              MEET THE
              <br />
              <span className="text-[#9B4FDE]">COACHES</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">
              Experienced players with a passion for coaching at all levels.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Coach Cards */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {coaches.map((coach, i) => (
              <CoachCard key={coach.name} {...coach} index={i} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
