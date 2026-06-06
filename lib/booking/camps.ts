import { supabaseAdmin } from "@/lib/supabase/server";

export type CampWindow = { startsAt: string; endsAt: string };

// Earliest and latest upcoming *published* camp session dates, used to show a
// dynamic date range on the marketing page. Returns null when no camp is live,
// so the page falls back to generic copy instead of a hardcoded date.
export async function getNextCampWindow(): Promise<CampWindow | null> {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return null;
  }
  const now = new Date().toISOString();

  const { data: programs } = await sb
    .from("programs")
    .select("id")
    .eq("type", "camp")
    .eq("status", "published")
    .is("deleted_at", null);
  if (!programs || programs.length === 0) return null;
  const ids = programs.map((p) => p.id);

  // Fetch the upcoming sessions as an array and take the first/last in JS.
  // (Mirrors the booking page's working query; avoids a .maybeSingle() quirk.)
  const { data: sessions } = await sb
    .from("sessions")
    .select("starts_at")
    .in("program_id", ids)
    .eq("status", "scheduled")
    .gte("starts_at", now)
    .is("deleted_at", null)
    .order("starts_at", { ascending: true });
  if (!sessions || sessions.length === 0) return null;

  return { startsAt: sessions[0].starts_at, endsAt: sessions[sessions.length - 1].starts_at };
}

// Format a window like "6 – 17 July" or "29 Sep – 3 Oct" (cross-month).
export function formatCampWindow(w: CampWindow): string {
  const tz = "Australia/Sydney";
  const s = new Date(w.startsAt);
  const e = new Date(w.endsAt);
  const day = (d: Date) => d.toLocaleDateString("en-AU", { day: "numeric", timeZone: tz });
  const month = (d: Date) => d.toLocaleDateString("en-AU", { month: "long", timeZone: tz });
  if (month(s) === month(e)) return `${day(s)} – ${day(e)} ${month(e)}`;
  return `${day(s)} ${month(s)} – ${day(e)} ${month(e)}`;
}
