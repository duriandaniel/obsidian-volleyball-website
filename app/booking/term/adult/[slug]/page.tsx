import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { weekday } from "@/lib/booking/load";
import { AdultDropinForm } from "./AdultDropinForm";

export const metadata: Metadata = {
  title: "Book a night | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PER_SESSION_FALLBACK_CENTS = 2000;

export default async function AdultScrimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = supabaseAdmin();

  const { data: program } = await sb
    .from("programs")
    .select("id, slug, title, age_min, venue_id, pricing_rule_id, default_capacity")
    .eq("slug", slug)
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (!program) notFound();

  // This page is only for adult drop-in programs; juniors enrol per-term.
  if (!isAdultProgram(program)) redirect(`/booking/term/${program.slug}`);

  const now = new Date().toISOString();
  const [{ data: venue }, { data: rule }, { data: sessions }] = await Promise.all([
    sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle(),
    sb.from("pricing_rules").select("term_per_session_cents").eq("id", program.pricing_rule_id ?? "").maybeSingle(),
    sb
      .from("sessions")
      .select("id, starts_at, ends_at")
      .eq("program_id", program.id)
      .eq("status", "scheduled")
      .gte("starts_at", now)
      .is("deleted_at", null)
      .order("starts_at"),
  ]);

  const perSessionCents = rule?.term_per_session_cents ?? PER_SESSION_FALLBACK_CENTS;
  const upcoming = sessions ?? [];

  // Spots left per session
  const sessionIds = upcoming.map((s) => s.id);
  const { data: bookings } = sessionIds.length
    ? await sb
        .from("bookings")
        .select("session_id")
        .in("session_id", sessionIds)
        .in("status", ["confirmed", "pending", "attended"])
        .is("deleted_at", null)
    : { data: [] as { session_id: string }[] };
  const bookedBy = new Map<string, number>();
  for (const b of bookings ?? []) bookedBy.set(b.session_id, (bookedBy.get(b.session_id) ?? 0) + 1);

  const nights = upcoming.map((s) => ({
    id: s.id,
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    spots_left: Math.max(0, program.default_capacity - (bookedBy.get(s.id) ?? 0)),
  }));

  const dayName = upcoming[0] ? weekday(upcoming[0].starts_at) : "";
  const venueName = venue ? (venue.address ? `${venue.name}, ${venue.address}` : venue.name) : "Venue TBA";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-md mx-auto px-6">
        <Link href="/booking/term/adult" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← All nights</Link>
        <h1 className="font-heading text-4xl mt-4 mb-1">{dayName} Social Scrim</h1>
        <div className="text-gray-400 mb-8">{venueName}</div>

        {nights.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-6 text-gray-400 text-sm">
            No upcoming nights for this day. Check the other nights.
          </div>
        ) : (
          <AdultDropinForm
            programId={program.id}
            perSessionCents={perSessionCents}
            nights={nights}
          />
        )}
      </div>
    </div>
  );
}
