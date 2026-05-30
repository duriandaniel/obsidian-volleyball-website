// Server-side loaders for the booking funnel. Pure data shaping on top of the
// term programs / sessions / pricing tables. The funnel pages stay dumb.

import { supabaseAdmin } from "@/lib/supabase/server";
import { isAdultProgram } from "@/lib/booking/audience";

export type TermProgram = {
  id: string;
  slug: string;
  title: string;
  season: string | null;
  skill_level: string | null;
  age_min: number | null;
  venue_id: string;
  venue_name: string;
  per_week_cents: number;
  weeks_remaining: number;
  first_session_at: string | null;
  first_session_ends_at: string | null;
  last_session_at: string | null;
  capacity: number;
  booked: number;
  is_adult: boolean;
};

const TZ = "Australia/Sydney";

export function weekday(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", { weekday: "long", timeZone: TZ });
}

export function timeRange(startIso: string, endIso: string | null): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: TZ });
  return endIso ? `${fmt(startIso)} – ${fmt(endIso)}` : fmt(startIso);
}

// Load all published term programs with derived booking fields.
export async function loadTermPrograms(): Promise<TermProgram[]> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return [];
  }
  const now = new Date().toISOString();

  const { data: programs } = await sb
    .from("programs")
    .select("id, slug, title, season, skill_level, age_min, default_capacity, venue_id, pricing_rule_id")
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null);
  if (!programs || programs.length === 0) return [];

  const venueIds = Array.from(new Set(programs.map((p) => p.venue_id)));
  const ruleIds = Array.from(new Set(programs.map((p) => p.pricing_rule_id).filter(Boolean)));

  const [{ data: venues }, { data: rules }, { data: sessions }] = await Promise.all([
    sb.from("venues").select("id, name").in("id", venueIds),
    sb.from("pricing_rules").select("id, term_per_session_cents").in("id", ruleIds),
    sb
      .from("sessions")
      .select("id, program_id, starts_at, ends_at")
      .in(
        "program_id",
        programs.map((p) => p.id)
      )
      .eq("status", "scheduled")
      .gte("starts_at", now)
      .is("deleted_at", null)
      .order("starts_at"),
  ]);

  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));
  const ruleById = new Map((rules ?? []).map((r) => [r.id, r.term_per_session_cents ?? 0]));

  // Bookings on the earliest upcoming session of each program (for spots-left).
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const { data: bookings } = sessionIds.length
    ? await sb
        .from("bookings")
        .select("session_id")
        .in("session_id", sessionIds)
        .in("status", ["confirmed", "pending", "attended"])
        .is("deleted_at", null)
    : { data: [] as { session_id: string }[] };
  const bookedBySession = new Map<string, number>();
  for (const b of bookings ?? []) bookedBySession.set(b.session_id, (bookedBySession.get(b.session_id) ?? 0) + 1);

  return programs
    .map((p): TermProgram => {
      const mySessions = (sessions ?? []).filter((s) => s.program_id === p.id);
      const first = mySessions[0];
      const last = mySessions[mySessions.length - 1];
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        season: p.season,
        skill_level: p.skill_level,
        age_min: p.age_min,
        venue_id: p.venue_id,
        venue_name: venueById.get(p.venue_id) ?? "Venue TBA",
        per_week_cents: ruleById.get(p.pricing_rule_id ?? "") ?? 0,
        weeks_remaining: mySessions.length,
        first_session_at: first?.starts_at ?? null,
        first_session_ends_at: first?.ends_at ?? null,
        last_session_at: last?.ends_at ?? null,
        capacity: p.default_capacity,
        booked: first ? bookedBySession.get(first.id) ?? 0 : 0,
        is_adult: isAdultProgram(p),
      };
    })
    .sort((a, b) => (a.first_session_at ?? "").localeCompare(b.first_session_at ?? ""));
}
