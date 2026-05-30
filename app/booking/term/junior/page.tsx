import type { Metadata } from "next";
import Link from "next/link";
import { loadTermPrograms, weekday, timeRange, type TermProgram } from "@/lib/booking/load";
import { formatCents, formatSpotsLeft } from "@/lib/booking/pricing";

export const metadata: Metadata = {
  title: "Junior Classes | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const revalidate = 30; // ISR: cached + prefetchable; capacity re-checked at checkout (DB trigger)

export default async function JuniorClassesPage() {
  const all = (await loadTermPrograms())
    .filter((p) => !p.is_adult)
    .sort((a, b) => (a.first_session_at ?? "").localeCompare(b.first_session_at ?? ""));
  const sub = all[0]
    ? [all[0].first_session_at ? weekday(all[0].first_session_at) : "", all[0].venue_name].filter(Boolean).join(" · ")
    : "";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/booking" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>

        {all.length === 0 ? (
          <Empty />
        ) : (
          <>
            <h1 className="font-heading text-3xl tracking-wide mt-4 mb-1 text-center">Pick a class</h1>
            {sub && <p className="text-center text-sm text-gray-500 mb-8">{sub}</p>}
            <div className="grid gap-3">
              {all.map((p) => (
                <ClassRow key={p.id} program={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Level only — the day + time shows on its own line, so strip the leading
// weekday and the trailing time: "Friday Beginners 4-5:30pm" -> "Beginners".
function classLabel(title: string): string {
  let t = title;
  for (const d of WEEKDAYS) {
    if (t.startsWith(d + " ")) { t = t.slice(d.length + 1); break; }
  }
  return t.replace(/\s*\d.*$/, "").trim() || t;
}

function ClassRow({ program: p }: { program: TermProgram }) {
  const soldOut = p.booked >= p.capacity;
  const total = p.per_week_cents * p.weeks_remaining;
  const label = classLabel(p.title);
  const day = p.first_session_at ? weekday(p.first_session_at) : "";
  const time = p.first_session_at ? timeRange(p.first_session_at, p.first_session_ends_at) : "";

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
            <div className="font-heading text-xl text-[#7E57C2]">{formatCents(total)}</div>
            <div className="text-xs text-gray-500">
              {p.weeks_remaining} week{p.weeks_remaining === 1 ? "" : "s"} · {formatSpotsLeft(p.capacity - p.booked)}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (soldOut) {
    return <div className="border border-white/5 rounded-xl opacity-60">{inner}</div>;
  }
  return (
    <Link
      href={`/booking/term/${p.slug}`}
      className="block border border-white/10 hover:border-[#7E57C2] rounded-xl transition-colors"
    >
      {inner}
    </Link>
  );
}

function Empty() {
  return (
    <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400 mt-4">
      No junior classes are open right now. Follow{" "}
      <a href="https://instagram.com/obsidianvolleyball" className="text-[#7E57C2]">@obsidianvolleyball</a>.
    </div>
  );
}
