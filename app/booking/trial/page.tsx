import type { Metadata } from "next";
import Link from "next/link";
import { loadTermPrograms, weekday, timeRange, type TermProgram } from "@/lib/booking/load";
import { formatCents, formatSpotsLeft, TRIAL_PRICE_CENTS, TRIAL_WINDOW_DAYS } from "@/lib/booking/pricing";

export const metadata: Metadata = {
  title: "Trial Class | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function classLabel(title: string): string {
  let t = title;
  for (const d of WEEKDAYS) {
    if (t.startsWith(d + " ")) { t = t.slice(d.length + 1); break; }
  }
  return t.replace(/\s*\d.*$/, "").trim() || t;
}

export default async function TrialPage() {
  // Only classes whose next session is within the trial window (next 2 weeks).
  const cutoffIso = new Date(Date.now() + TRIAL_WINDOW_DAYS * 86400_000).toISOString();
  const classes = (await loadTermPrograms())
    .filter((p) => !p.is_adult && p.weeks_remaining > 0 && p.first_session_at !== null && p.first_session_at <= cutoffIso)
    .sort((a, b) => (a.first_session_at ?? "").localeCompare(b.first_session_at ?? ""));

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/booking" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mt-4 mb-2">Trial Class</h1>
        <p className="text-sm text-gray-400 mb-8 max-w-lg">
          {formatCents(TRIAL_PRICE_CENTS)} per player. Try a junior class before committing to the term. Limit one trial per player. Pick a class to try.
        </p>

        {classes.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
            No classes are open for a trial right now. Follow{" "}
            <a href="https://instagram.com/obsidianvolleyball" className="text-[#7E57C2]">@obsidianvolleyball</a>.
          </div>
        ) : (
          <div className="grid gap-3">
            {classes.map((p) => (
              <TrialRow key={p.id} program={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrialRow({ program: p }: { program: TermProgram }) {
  const soldOut = p.booked >= p.capacity;
  const label = classLabel(p.title);
  const day = p.first_session_at ? weekday(p.first_session_at) : "";
  const time = p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : null;

  const inner = (
    <div className="flex items-center justify-between gap-4 px-5 py-5">
      <div>
        <div className="font-heading text-xl">{label}</div>
        <div className="text-sm text-gray-400 mt-0.5">{[day, time].filter(Boolean).join(" · ")}</div>
      </div>
      <div className="text-right">
        {soldOut ? (
          <div className="text-sm text-gray-500">Sold out</div>
        ) : (
          <>
            <div className="font-heading text-xl text-[#7E57C2]">{formatCents(TRIAL_PRICE_CENTS)}</div>
            <div className="text-xs text-gray-500">{formatSpotsLeft(p.capacity - p.booked)}</div>
          </>
        )}
      </div>
    </div>
  );

  if (soldOut) return <div className="border border-white/5 rounded-xl opacity-60">{inner}</div>;
  return (
    <Link
      href={`/booking/term/${p.slug}?plan=trial`}
      className="block border border-white/10 hover:border-[#7E57C2] rounded-xl transition-colors"
    >
      {inner}
    </Link>
  );
}
