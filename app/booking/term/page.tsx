import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loadTermPrograms } from "@/lib/booking/load";

export const metadata: Metadata = {
  title: "Weekly Classes | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function WeeklyClassesPage() {
  const programs = await loadTermPrograms();
  const hasAdult = programs.some((p) => p.is_adult);
  const hasJunior = programs.some((p) => !p.is_adult);

  // Auto-skip a step that has only one option.
  if (hasJunior && !hasAdult) redirect("/booking/term/junior");
  if (hasAdult && !hasJunior) redirect("/booking/term/adult");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/booking" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mt-4 mb-10 text-center">
          Who&apos;s playing?
        </h1>

        {!hasAdult && !hasJunior ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {hasJunior && <Box href="/booking/term/junior" eyebrow="AGES 8–18" label="Junior Classes" />}
            {hasAdult && <Box href="/booking/term/adult" eyebrow="18+ DROP-IN" label="Adult Social Scrim" />}
          </div>
        )}
      </div>
    </div>
  );
}

function Box({ href, eyebrow, label }: { href: string; eyebrow: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center text-center border border-[#9B4FDE]/30 hover:border-[#9B4FDE] hover:bg-white/[0.02] rounded-xl py-16 px-6 transition-colors"
    >
      <div className="text-[#9B4FDE] font-heading text-xs tracking-[0.35em] mb-3">{eyebrow}</div>
      <div className="font-heading text-2xl md:text-3xl">{label}</div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
      No weekly classes are open right now. Follow{" "}
      <a href="https://instagram.com/obsidianvolleyball" className="text-[#9B4FDE]">@obsidianvolleyball</a> for updates.
    </div>
  );
}
