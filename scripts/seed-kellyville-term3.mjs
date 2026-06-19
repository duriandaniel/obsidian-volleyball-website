// Seed Kellyville Term 3 2026 junior classes against the live Supabase.
// Idempotent: safe to re-run (find-or-create venue, upsert programs by slug,
// reconcile sessions by timestamp).
//   node --env-file=.env.local scripts/seed-kellyville-term3.mjs
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const VENUE_NAME = "Obsidian Volleyball Academy Kellyville";
const VENUE_ADDRESS = "Cnr York Rd & Queensbury Ave, Kellyville NSW 2155";
const SEASON = "Term 3 2026";

// 4:00–5:30pm AEST (UTC+10, no DST until October) => 06:00–07:30 UTC.
const T = (d) => ({ start: `${d}T06:00:00+00:00`, end: `${d}T07:30:00+00:00` });
const TUES = ["2026-07-21","2026-07-28","2026-08-04","2026-08-11","2026-08-18","2026-08-25","2026-09-01","2026-09-08","2026-09-15","2026-09-22"].map(T);
const WEDS = ["2026-07-22","2026-07-29","2026-08-05","2026-08-12","2026-08-19","2026-08-26","2026-09-02","2026-09-09","2026-09-16","2026-09-23"].map(T);

async function getVenueId() {
  const { data: existing } = await sb.from("venues").select("id").eq("name", VENUE_NAME).is("deleted_at", null).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await sb.from("venues").insert({ name: VENUE_NAME, address: VENUE_ADDRESS }).select("id").single();
  if (error) throw error;
  console.log(`+ created venue ${VENUE_NAME}`);
  return data.id;
}

async function getTermRuleId() {
  const { data } = await sb.from("pricing_rules").select("id, name, term_per_session_cents").eq("scope", "term");
  const rule = (data || []).find((r) => r.term_per_session_cents === 3600) || (data || []).find((r) => /default term/i.test(r.name));
  if (!rule) throw new Error("No $36/term pricing rule found");
  return rule.id;
}

async function upsertProgram({ title, slug, skill_level, venueId, ruleId }) {
  const fields = {
    type: "term", title, slug, season: SEASON, venue_id: venueId,
    skill_level, age_min: 8, age_max: 18, status: "published",
    pricing_rule_id: ruleId, default_capacity: 24,
  };
  const { data: existing } = await sb.from("programs").select("id").eq("slug", slug).maybeSingle();
  if (existing) {
    await sb.from("programs").update(fields).eq("id", existing.id);
    console.log(`= updated program ${slug}`);
    return existing.id;
  }
  const { data, error } = await sb.from("programs").insert(fields).select("id").single();
  if (error) throw error;
  console.log(`+ created program ${slug}`);
  return data.id;
}

async function reconcileSessions(programId, dates) {
  const { data: existing } = await sb.from("sessions").select("starts_at").eq("program_id", programId).is("deleted_at", null);
  const have = new Set((existing || []).map((s) => Date.parse(s.starts_at)));
  const toInsert = dates
    .filter((d) => !have.has(Date.parse(d.start)))
    .map((d) => ({ program_id: programId, starts_at: d.start, ends_at: d.end, status: "scheduled" }));
  if (toInsert.length) {
    const { error } = await sb.from("sessions").insert(toInsert);
    if (error) throw error;
  }
  console.log(`  sessions: ${toInsert.length} inserted, ${(existing || []).length} already present`);
}

const venueId = await getVenueId();
const ruleId = await getTermRuleId();

const tueId = await upsertProgram({ title: "Tuesday Beginners 4-5:30pm", slug: "tue-beginners-4pm", skill_level: "beginner", venueId, ruleId });
await reconcileSessions(tueId, TUES);

const wedId = await upsertProgram({ title: "Wednesday Intermediate 4-5:30pm", slug: "wed-intermediate-4pm", skill_level: "intermediate", venueId, ruleId });
await reconcileSessions(wedId, WEDS);

console.log("Done.");
