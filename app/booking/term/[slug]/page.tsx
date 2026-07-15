import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdultProgram } from "@/lib/booking/audience";
import { CASUAL_PRICE_CENTS, trialPriceCentsForVenue, billableTermWeeks } from "@/lib/booking/pricing";
import { loadTermPrograms } from "@/lib/booking/load";
import { EnrolPanels } from "./EnrolPanels";

export const metadata: Metadata = {
  title: "Enrol | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

// ISR: cached + prefetchable, same as the class list (/booking/term/junior).
// Capacity is authoritatively re-checked at checkout by the DB trigger, so a
// spot filling within the 30s window can never oversell — worst case a parent
// sees the enrol form for an already-full class and is stopped at payment.
export const revalidate = 30;

// Prebuild every class the junior list links to (same filter as that page), so
// each enrol page is fully static and the list's <Link>s prefetch the whole
// payload — the click lands instantly. New slugs not built here still render
// on-demand and are then cached (dynamicParams defaults to true).
export async function generateStaticParams() {
  const programs = await loadTermPrograms();
  return programs.filter((p) => !p.is_adult && p.weeks_remaining > 0).map((p) => ({ slug: p.slug }));
}

// Shape of the embedded query below. Declared explicitly because supabase-js
// can't infer embedded-select result types without generated Database types.
type ProgramRow = {
  id: string;
  slug: string;
  title: string;
  season: string | null;
  description: string | null;
  skill_level: string | null;
  age_min: number | null;
  age_max: number | null;
  default_capacity: number;
  venue_id: string;
  pricing_rule_id: string | null;
  venues: { name: string; address: string | null } | null;
  pricing_rules: { term_per_session_cents: number | null } | null;
  sessions: { id: string; starts_at: string; ends_at: string }[];
};

export default async function TermProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = supabaseAdmin();
  const nowIso = new Date().toISOString();

  // One round-trip: program + its venue + pricing rule + upcoming sessions.
  // (Previously three serial hops: program → [venue,rule,sessions] → count.)
  // Embedded session filters keep the parent row even when zero match, and are
  // ordered ascending so [0] is the next upcoming class. Bookable until a class
  // ENDS, so one running right now still shows (and still counts toward pricing).
  const { data } = await sb
    .from("programs")
    .select(
      "id, slug, title, season, description, skill_level, age_min, age_max, default_capacity, venue_id, pricing_rule_id, " +
        "venues(name, address), pricing_rules(term_per_session_cents), sessions(id, starts_at, ends_at)"
    )
    .eq("slug", slug)
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null)
    .eq("sessions.status", "scheduled")
    .gte("sessions.ends_at", nowIso)
    .is("sessions.deleted_at", null)
    .order("starts_at", { referencedTable: "sessions" })
    .maybeSingle();
  const program = data as unknown as ProgramRow | null;
  if (!program) notFound();

  // Adults book per-night through the standalone drop-in flow.
  if (isAdultProgram(program)) redirect("/booking/adult");

  const venue = program.venues;
  const perWeekCents = program.pricing_rules?.term_per_session_cents ?? 0;
  const remainingSessions = program.sessions ?? [];
  const billableWeeks = billableTermWeeks(
    venue?.name,
    remainingSessions.map((s) => s.starts_at)
  );

  // Capacity check on the next upcoming session. Kept as a second query because
  // it needs the first session's id — which the embedded query above already
  // resolved, so this is one extra hop rather than the old two.
  let booked = 0;
  if (remainingSessions[0]) {
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("session_id", remainingSessions[0].id)
      .in("status", ["confirmed", "pending", "attended"])
      .is("deleted_at", null);
    booked = count ?? 0;
  }
  const soldOut = booked >= program.default_capacity;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/booking/term/junior" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← All classes</Link>
        <h1 className="font-heading text-4xl mt-4 mb-2">{program.title}</h1>
        <div className="text-gray-400 mb-8">
          {venue ? (venue.address ? `${venue.name}, ${venue.address}` : venue.name) : "Venue TBA"}
        </div>

        <Suspense fallback={<PanelsFallback />}>
          <EnrolPanels
            programId={program.id}
            programTitle={program.title}
            perWeekCents={perWeekCents}
            billableWeeks={billableWeeks}
            casualPriceCents={CASUAL_PRICE_CENTS}
            trialPriceCents={trialPriceCentsForVenue(venue?.name)}
            sessions={remainingSessions.map((s) => ({ id: s.id, starts_at: s.starts_at, ends_at: s.ends_at }))}
            soldOut={soldOut}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Shown in the static shell while EnrolPanels hydrates (it reads ?plan= on the
// client). On a prefetched navigation this is barely visible.
function PanelsFallback() {
  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px] animate-pulse">
      <div>
        <div className="h-6 w-40 bg-white/10 rounded mb-3" />
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <div className="h-11 border-b border-white/5 bg-white/[0.04]" />
          <div className="h-11 border-b border-white/5 bg-white/[0.04]" />
          <div className="h-11 bg-white/[0.04]" />
        </div>
      </div>
      <div className="md:sticky md:top-24 self-start">
        <div className="h-64 border border-white/10 rounded-lg bg-white/[0.02]" />
      </div>
    </div>
  );
}
