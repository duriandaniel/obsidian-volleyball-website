import type { Metadata } from "next";
import Link from "next/link";
import MensEoiForm from "@/components/MensEoiForm";

export const metadata: Metadata = {
  title: "Men's Development Squad | Obsidian Volleyball Academy",
  description:
    "A structured men's development program at West Ryde. Starting soon and taking expressions of interest. Register and we'll email you when trials open.",
  robots: { index: false, follow: false },
};

const HOW_IT_WILL_WORK = [
  "A positional trial to pick the squad",
  "Then an 8 week coached squad focused on technical training and specific skills, not just reps",
  "High level coaches you wouldn't normally train under",
  "Runs in batches through the year",
];

const ELIGIBILITY = [
  "16+ years old",
  "No SVL Premier or Reserves in the last 3 years",
];

const VISION = [
  "Building toward a representative team",
  "A balanced squad, every position covered",
  "Serious training with a social core",
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

        <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mt-6 mb-4">STARTING SOON · TAKING EXPRESSIONS OF INTEREST</p>
        <h1 className="font-heading text-4xl md:text-6xl tracking-wide mb-4 leading-[0.95]">
          MEN&apos;S DEVELOPMENT
          <br />
          <span className="text-[#7E57C2]">SQUAD</span>
        </h1>
        <p className="text-white text-xl md:text-2xl leading-snug mb-4">
          Building the highest quality men&apos;s volleyball development program in Sydney.
        </p>
        <p className="text-sm text-gray-500 mb-8">16+ · Bennelong Sports Centre, West Ryde</p>

        <div className="border border-white/10 rounded-lg p-6 bg-white/[0.02] mb-12">
          <p className="text-gray-300 leading-relaxed">
            The squad is postponed for now while we focus on our junior programs. We&apos;re not running trials at the
            moment, but we&apos;re taking expressions of interest and we&apos;ll email you as soon as the first batch
            opens. Thanks for your interest, and we hope to see you on court.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-3">
            In the meantime, our Friday adult scrims are open every week, 7 to 9 PM at West Ryde:{" "}
            <Link href="/booking/adult/scrim" className="text-[#7E57C2] underline hover:text-white">
              book a scrim
            </Link>
            .
          </p>
        </div>

        <div className="space-y-10">
          <Section title="How it will work" items={HOW_IT_WILL_WORK} />
          <Section title="Eligibility" items={ELIGIBILITY} />
          <Section title="The vision" items={VISION} />
        </div>

        <div className="mt-12" id="eoi">
          <MensEoiForm />
        </div>
      </div>
    </div>
  );
}
