import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Men's Development Squad | Obsidian Volleyball Academy",
  description:
    "A structured men's development program at West Ryde. Two week positional trial, then an 8 week coached squad. Winter '26 Batch.",
  robots: { index: false, follow: false },
};

const JOINING = [
  "8 week structured curriculum",
  "Whiteboard tactics and team systems",
  "Film review of your own play",
  "Position specific coaching",
  "Individual assessment and progress tracking",
  "End of batch showcase",
  "Led by premier level coaches (NSW top grade)",
];

const TRIAL = [
  "A positional tryout: you nominate the position(s) you play",
  "Assessed on skill, attitude and consistency",
  "$15 per night, Friday 24 and 31 July",
  "Trial spots are limited",
];

const SQUAD = [
  "8 weeks, Friday 7 August to 25 September",
  "$216 all in, about $27 per week",
  "Includes your training shirt",
  "Private offer with 48 hours to lock in your place",
];

const VISION = [
  "Build toward a representative team for future competitions",
  "One squad, built to two team position ratios",
  "Consistency earns first pick",
  "Quarterly batches: Winter, Spring, Summer, Autumn",
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
        <p className="text-gray-300 text-lg mb-2">A structured men&apos;s development program. Not social drop in.</p>
        <p className="text-sm text-gray-500 mb-12">18+ · Bennelong Sports Centre, West Ryde · Fridays 7 to 9pm</p>

        <div className="space-y-10">
          <Section title="What you're joining" items={JOINING} />
          <Section title="The 2 week trial" items={TRIAL} />
          <Section title="If you make the squad" items={SQUAD} />
          <Section title="The vision" items={VISION} />
        </div>

        <Link
          href="/booking/mens-squad"
          className="mt-12 inline-block bg-[#5E35A8] hover:bg-[#7E57C2] text-white font-heading text-lg tracking-[0.2em] px-10 py-5 rounded transition-colors"
        >
          BOOK YOUR TRIAL
        </Link>
      </div>
    </div>
  );
}
