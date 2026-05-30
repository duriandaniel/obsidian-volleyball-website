import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loadTermPrograms, weekday, timeRange } from "@/lib/booking/load";

export const metadata: Metadata = {
  title: "Adult Social Scrim | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdultDayPickerPage() {
  const adult = (await loadTermPrograms())
    .filter((p) => p.is_adult && p.weeks_remaining > 0)
    .sort((a, b) => (a.first_session_at ?? "").localeCompare(b.first_session_at ?? ""));

  // Auto-skip when only one day runs.
  if (adult.length === 1) redirect(`/booking/term/adult/${adult[0].slug}`);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/booking/term" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl tracking-wide mt-4 mb-2 text-center">Pick a night</h1>
        <p className="text-center text-sm text-gray-500 mb-8">Social scrim · 18+ · drop in any night</p>

        {adult.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
            No adult scrims are scheduled right now. Follow{" "}
            <a href="https://instagram.com/obsidianvolleyball" className="text-[#9B4FDE]">@obsidianvolleyball</a>.
          </div>
        ) : (
          <div className="grid gap-4">
            {adult.map((p) => (
              <Link
                key={p.id}
                href={`/booking/term/adult/${p.slug}`}
                className="flex items-center justify-between gap-4 border border-white/10 hover:border-[#9B4FDE] rounded-xl px-6 py-8 transition-colors"
              >
                <div>
                  <div className="font-heading text-2xl">
                    {p.first_session_at ? weekday(p.first_session_at) : "TBA"}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : ""}
                    {" "}· {p.venue_name}
                  </div>
                </div>
                <div className="font-heading text-lg text-[#9B4FDE]">$20<span className="text-xs text-gray-500">/night</span></div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
