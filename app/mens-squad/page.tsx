import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Men's Development Squad | Obsidian Volleyball Academy",
  description:
    "A structured men's development program at West Ryde. Two week positional trial, then an 8 week coached squad. Winter '26 Batch.",
  robots: { index: false, follow: false },
};

const JOINING = [
  "8 weeks focused on getting better, not just game time",
  "Position specific coaching",
  "High level coaches who play your position",
];

// High level coaching team; names shown as "featuring" until locked.
const COACHES = [
  { name: "Chris K", role: "Men's Premier Outside Hitter", year: "2026", note: "Sydney North MVP" },
  { name: "Nelson L", role: "Men's Reserves Setter", year: "2026", note: "Sydney East captain" },
  { name: "Kaveesh V", role: "Div 1 Opposite", year: "2026", note: "" },
  { name: "Varun P", role: "Premier Libero", year: "2025", note: "" },
];

const TRYOUTS = [
  "Two weeks of team selection",
  "Nominate the position you play",
  "Fri 24 and 31 July, $15 each night",
  "We recommend signing up for both nights",
];

const ELIGIBILITY = [
  "16+ years old",
  "Open to all levels",
  "No SVL Premier or Reserves in the last 3 years",
];

const SQUAD = [
  "8 weeks, Friday 7 August to 25 September",
  "$216 all in, about $27 per week",
  "Includes your training shirt",
  "Private offer with 48 hours to lock in your place",
];

const VISION = [
  "Building toward a representative team",
  "A balanced squad, every position covered",
  "Specialist coaches you wouldn't normally train under",
  "Runs four times a year",
];

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-heading text-2xl tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-gray-300">
            <span className="text-[#7E57C2] flex-shrink-0">+</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MensSquadInfoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/booking/adult" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">
          ← Back
        </Link>

        <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mt-6 mb-4">WINTER &apos;26 BATCH · INAUGURAL</p>
        <h1 className="font-heading text-4xl md:text-6xl tracking-wide mb-4 leading-[0.95]">
          MEN&apos;S DEVELOPMENT
          <br />
          <span className="text-[#7E57C2]">SQUAD</span>
        </h1>
        <p className="text-white text-xl md:text-2xl leading-snug mb-4">
          Building the highest quality men&apos;s volleyball development program in Sydney. Now picking its first squad.
        </p>
        <p className="text-sm text-gray-500 mb-12">16+ · Bennelong Sports Centre, West Ryde · Fridays 7 to 9pm</p>

        <div className="space-y-10">
          <Section title="What you're joining" items={JOINING} />

          <div>
            <h2 className="font-heading text-2xl tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">The coaching team</h2>
            <p className="text-gray-400 mb-4">
              A team of high level players, each coaching their own position. Featuring:
            </p>
            <ul className="space-y-3">
              {COACHES.map((c) => (
                <li key={c.name} className="flex gap-3 text-gray-300">
                  <span className="text-[#7E57C2] flex-shrink-0">+</span>
                  <span>
                    <span className="text-white">{c.name}</span> · {c.role} · {c.year}
                    {c.note ? ` · ${c.note}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Section title="The 2 week tryouts" items={TRYOUTS} />
          <Section title="Eligibility" items={ELIGIBILITY} />
          <Section title="If you make the squad" items={SQUAD} />
          <Section title="The vision" items={VISION} />
        </div>

        <Link
          href="/booking/mens-squad"
          className="mt-12 inline-block bg-[#5E35A8] hover:bg-[#7E57C2] text-white font-heading text-lg tracking-[0.2em] px-10 py-5 rounded transition-colors"
        >
          SIGN UP FOR THE TRYOUTS
        </Link>
      </div>
    </div>
  );
}
