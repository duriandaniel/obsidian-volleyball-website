import type { Metadata } from "next";
import Link from "next/link";
import { loadAdultSessions } from "@/lib/booking/load";
import { AdultSessionsForm } from "./AdultSessionsForm";

export const metadata: Metadata = {
  title: "Adult Sessions | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdultSessionsPage() {
  const sessions = await loadAdultSessions();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/booking" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mt-4 mb-1">Adult Social Scrim</h1>
        <p className="text-sm text-gray-500 mb-8">18+ · drop in · $20 per night</p>

        {sessions.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
            No scrim nights are scheduled right now. Follow{" "}
            <a href="https://instagram.com/obsidianvolleyball" className="text-[#9B4FDE]">@obsidianvolleyball</a>.
          </div>
        ) : (
          <AdultSessionsForm sessions={sessions} />
        )}
      </div>
    </div>
  );
}
