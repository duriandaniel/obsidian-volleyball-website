import type { Metadata } from "next";
import Link from "next/link";
import { loadProgramSessionsBySlug } from "@/lib/booking/load";
import { AdultSessionsForm } from "@/app/booking/adult/AdultSessionsForm";

export const metadata: Metadata = {
  title: "Men's Development Squad — Trial | Obsidian Volleyball Academy",
  description:
    "A structured men's development program at West Ryde. Two-week positional trial, then an 8-week coached squad. Winter '26 Batch — trial spots are limited.",
  robots: { index: false, follow: false },
};

export const revalidate = 30; // ISR: cached + prefetchable; capacity re-checked at checkout (DB trigger)

const WHAT_YOU_GET = [
  "An 8-week structured curriculum — not social drop-in",
  "Whiteboard tactics and team-system coaching",
  "Film review of your own play",
  "Position-specific coaching",
  "Individual assessment and progress tracking",
  "An end-of-batch showcase",
];

export default async function MensSquadPage() {
  const sessions = await loadProgramSessionsBySlug("mens-dev-squad-trial");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/booking/adult" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">
          ← Back
        </Link>

        {/* Hero */}
        <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mt-6 mb-4">
          WINTER &apos;26 BATCH · INAUGURAL
        </p>
        <h1 className="font-heading text-4xl md:text-6xl tracking-wide mb-4 leading-[0.95]">
          MEN&apos;S DEVELOPMENT
          <br />
          <span className="text-[#7E57C2]">SQUAD</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-3">
          A structured men&apos;s development program — built to take committed players and turn them into a squad.
          It starts with a two-week positional trial, then an 8-week coached batch.
        </p>
        <p className="text-sm text-gray-500 mb-10">
          18+ · Bennelong Sports Centre, West Ryde · Fridays 7–9pm · led by premier-level coaches (NSW top grade)
        </p>

        {/* What it is */}
        <div className="border border-white/10 rounded-lg p-6 md:p-8 bg-white/[0.02] mb-8">
          <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2] mb-4">WHAT YOU&apos;RE JOINING</div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {WHAT_YOU_GET.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-300">
                <span className="text-[#7E57C2] flex-shrink-0">+</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The trial */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl tracking-wide mb-3">The 2-week trial — a positional tryout</h2>
          <p className="text-gray-400 leading-relaxed mb-3 max-w-2xl">
            The trial is how we pick the squad. You&apos;ll nominate the position(s) you play, and we assess on skill,
            attitude, and consistency. We&apos;re building one full squad to two-team position ratios, and the batch
            runs even if we come in under strength. Consistency earns first pick.
          </p>
          <p className="text-gray-400 leading-relaxed max-w-2xl">
            The bigger picture: this develops toward a representative team for future competitions. Batches run
            quarterly — Winter, then Spring, Summer, Autumn — and this is the inaugural Winter &apos;26 Batch.
          </p>
        </div>

        {/* Squad price, stated up front so only serious players commit */}
        <div className="border border-[#7E57C2]/40 rounded-lg p-6 bg-[#7E57C2]/[0.06] mb-8">
          <div className="font-heading text-xs tracking-[0.3em] text-[#7E57C2] mb-3">IF YOU MAKE THE SQUAD</div>
          <p className="text-gray-300 leading-relaxed">
            The 8-week squad is <strong className="text-white">$216 all-in</strong> — about{" "}
            <strong className="text-white">$27/week</strong>, and it includes your training shirt. Make the squad and
            you&apos;ll get a private offer with 48 hours to lock in your place.
          </p>
        </div>

        {/* Book */}
        <div className="mb-4 flex items-baseline justify-between gap-4 flex-wrap">
          <h2 className="font-heading text-2xl tracking-wide">Book your trial — $15 / night</h2>
          <span className="text-sm text-[#7E57C2] font-heading tracking-wide">Trial spots are limited</span>
        </div>

        {sessions.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
            Trial nights aren&apos;t open for booking just yet. Follow{" "}
            <a href="https://instagram.com/obsidianvolleyball" className="text-[#7E57C2]">
              @obsidianvolleyball
            </a>{" "}
            for the drop.
          </div>
        ) : (
          <AdultSessionsForm sessions={sessions} showJersey={false} squadIntake />
        )}
      </div>
    </div>
  );
}
