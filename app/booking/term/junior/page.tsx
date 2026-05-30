import type { Metadata } from "next";
import Link from "next/link";
import { loadTermPrograms, weekday, type TermProgram } from "@/lib/booking/load";
import { formatCents, formatSpotsLeft } from "@/lib/booking/pricing";

export const metadata: Metadata = {
  title: "Junior Classes | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const groupKey = (p: TermProgram) =>
  `${p.first_session_at ? weekday(p.first_session_at) : "TBA"}__${p.venue_id}`;
const groupLabel = (p: TermProgram) =>
  `${p.first_session_at ? weekday(p.first_session_at) : "Day TBA"} · ${p.venue_name}`;

export default async function JuniorClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;
  const all = (await loadTermPrograms()).filter((p) => !p.is_adult);

  // Distinct day+venue groups
  const groups = new Map<string, TermProgram[]>();
  for (const p of all) {
    const k = groupKey(p);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(p);
  }
  const keys = Array.from(groups.keys());

  // Auto-skip: with a single day+venue, go straight to its classes.
  const activeKey = keys.length === 1 ? keys[0] : g && groups.has(g) ? g : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link
          href={activeKey && keys.length > 1 ? "/booking/term/junior" : "/booking"}
          className="text-xs text-gray-500 hover:text-white tracking-wider uppercase"
        >
          ← Back
        </Link>

        {all.length === 0 ? (
          <Empty />
        ) : activeKey ? (
          <ClassList programs={groups.get(activeKey)!} heading={groupLabel(groups.get(activeKey)![0])} />
        ) : (
          <>
            <h1 className="font-heading text-3xl tracking-wide mt-4 mb-8 text-center">Pick a day</h1>
            <div className="grid gap-4">
              {keys.map((k) => (
                <Link
                  key={k}
                  href={`/booking/term/junior?g=${encodeURIComponent(k)}`}
                  className="border border-[#7E57C2]/30 hover:border-[#7E57C2] rounded-xl py-10 text-center font-heading text-2xl transition-colors"
                >
                  {groupLabel(groups.get(k)![0])}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClassList({ programs, heading }: { programs: TermProgram[]; heading: string }) {
  const sorted = [...programs].sort((a, b) => (a.first_session_at ?? "").localeCompare(b.first_session_at ?? ""));
  return (
    <>
      <h1 className="font-heading text-3xl tracking-wide mt-4 mb-1 text-center">Pick a class</h1>
      <p className="text-center text-sm text-gray-500 mb-8">{heading}</p>
      <div className="grid gap-3">
        {sorted.map((p) => (
          <ClassRow key={p.id} program={p} />
        ))}
      </div>
    </>
  );
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// The group header already shows the day, so drop a leading weekday from the
// title: "Friday Beginners 4-5:30pm" -> "Beginners 4-5:30pm".
function classLabel(title: string): string {
  for (const d of WEEKDAYS) {
    if (title.startsWith(d + " ")) return title.slice(d.length + 1);
  }
  return title;
}

function ClassRow({ program: p }: { program: TermProgram }) {
  const soldOut = p.booked >= p.capacity;
  const total = p.per_week_cents * p.weeks_remaining;
  const label = classLabel(p.title);

  const inner = (
    <div className="flex items-center justify-between gap-4 px-5 py-5">
      <div>
        <div className="font-heading text-xl">{label}</div>
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
