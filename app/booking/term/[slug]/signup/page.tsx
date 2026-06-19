import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { weekday, timeRange } from "@/lib/booking/load";
import { TermSignupForm } from "./TermSignupForm";

export const metadata: Metadata = {
  title: "Enrol | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "01", h: "Enrol now", b: "Fill in the form below. No card, nothing to pay." },
  { n: "02", h: "Try two weeks", b: "Come along for your first two lessons, free." },
  { n: "03", h: "Decide", b: "Continue? Pay for the full term, including the two weeks. Not for you? No charge." },
];

export default async function TermSignupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = supabaseAdmin();

  const { data: program } = await sb
    .from("programs")
    .select("id, slug, title, type, status, age_min, venue_id")
    .eq("slug", slug)
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (!program) notFound();
  if (isAdultProgram(program)) redirect("/booking/adult");

  const [{ data: venue }, { data: sessions }] = await Promise.all([
    sb.from("venues").select("name").eq("id", program.venue_id).maybeSingle(),
    sb
      .from("sessions")
      .select("starts_at, ends_at")
      .eq("program_id", program.id)
      .eq("status", "scheduled")
      .gte("starts_at", new Date().toISOString())
      .is("deleted_at", null)
      .order("starts_at")
      .limit(1),
  ]);

  const first = sessions?.[0];
  const dayLabel = first ? weekday(first.starts_at) : "";
  const timeLabel = first ? timeRange(first.starts_at, first.ends_at) : "";
  const venueName = venue?.name ?? "TBA";
  const classLine = [dayLabel, timeLabel, venueName].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/booking/term/junior" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>

        <h1 className="font-heading text-3xl sm:text-4xl tracking-wide mt-4 mb-1">Enrol: {program.title}</h1>
        {classLine && <p className="text-sm text-gray-500 mb-8">{classLine}</p>}

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {STEPS.map((s) => (
            <div key={s.n} className="border border-white/[0.08] bg-[#111] rounded-lg p-4">
              <p className="font-heading text-2xl text-[#7E57C2] mb-1">{s.n}</p>
              <p className="font-heading text-white text-sm tracking-wide mb-1">{s.h}</p>
              <p className="text-gray-500 text-xs leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>

        {/* Plain-English policy */}
        <div className="border border-[#7E57C2]/30 bg-[#7E57C2]/[0.06] rounded-xl p-5 mb-8 text-sm leading-relaxed text-gray-300">
          Enrol now and your first 2 lessons are free to try. Love it? You&apos;ll pay for the full
          term to keep your spot. Not for you? Just let us know after the 2 weeks, no charge.
        </div>

        <TermSignupForm
          program={{
            id: program.id,
            title: program.title,
            dayLabel,
            timeLabel,
            venueName,
          }}
        />
      </div>
    </div>
  );
}
