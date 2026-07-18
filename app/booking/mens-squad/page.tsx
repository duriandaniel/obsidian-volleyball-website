import type { Metadata } from "next";
import Link from "next/link";
import { loadProgramSessionsBySlug } from "@/lib/booking/load";
import { AdultSessionsForm } from "@/app/booking/adult/AdultSessionsForm";

export const metadata: Metadata = {
  title: "Men's Development Squad Trial | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const revalidate = 30; // ISR: cached + prefetchable; capacity re-checked at checkout (DB trigger)

export default async function MensSquadBookingPage() {
  const sessions = await loadProgramSessionsBySlug("mens-dev-squad-trial");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/booking/adult" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mt-4 mb-1">Men&apos;s Development Squad Trial</h1>
        <p className="text-sm text-gray-500 mb-5">$15 per night · Fridays 7 to 9pm · Bennelong, West Ryde · trial for your spot in the squad</p>

        <Link
          href="/mens-squad"
          className="flex items-center justify-between gap-4 border border-[#7E57C2]/40 hover:border-[#7E57C2] rounded-lg px-5 py-4 bg-[#7E57C2]/[0.06] transition-colors group"
        >
          <span>
            <span className="block font-heading tracking-wide text-white">New here? Read about the squad first</span>
            <span className="block text-sm text-gray-400">
              What you&apos;re trialling for: the coaching, the 8 week squad and how selection works.
            </span>
          </span>
          <span className="text-[#7E57C2] group-hover:text-white font-heading text-sm tracking-[0.15em] uppercase whitespace-nowrap">
            Read more →
          </span>
        </Link>

        <div className="mt-8">
          {sessions.length === 0 ? (
            <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
              Trial nights aren&apos;t open for booking just yet. Follow{" "}
              <a href="https://instagram.com/obsidianvolleyball" className="text-[#7E57C2]">@obsidianvolleyball</a>.
            </div>
          ) : (
            <AdultSessionsForm sessions={sessions} showJersey={false} squadIntake />
          )}
        </div>
      </div>
    </div>
  );
}
