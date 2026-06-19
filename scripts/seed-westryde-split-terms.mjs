// Split West Ryde into separate Term 2 and Term 3 enrolments (one program each),
// so a parent enrols for a whole term at $36/session. Terms are separate.
// Idempotent: safe to re-run.
//   node --env-file=.env.local scripts/seed-westryde-split-terms.mjs
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const TERM3_CUTOFF = "2026-07-21T00:00:00+00:00"; // Term 3 starts; nothing between 3 Jul and 24 Jul
const FRIDAYS = ["2026-07-24","2026-07-31","2026-08-07","2026-08-14","2026-08-21","2026-08-28","2026-09-04","2026-09-11","2026-09-18","2026-09-25"];

// existing Term 2 slug -> [startUTC, endUTC]
const T2 = {
  "fri-beginners-4pm": ["06:00:00+00:00", "07:30:00+00:00"],
  "fri-intermediate-4pm": ["06:00:00+00:00", "07:30:00+00:00"],
  "fri-intermediate-530pm": ["07:30:00+00:00", "09:00:00+00:00"],
  "fri-advanced-530pm": ["07:30:00+00:00", "09:00:00+00:00"],
};

for (const [slug, [startT, endT]] of Object.entries(T2)) {
  const { data: src } = await sb
    .from("programs")
    .select("id, title, season, skill_level, age_min, age_max, default_capacity, venue_id, pricing_rule_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!src) { console.log(`! not found: ${slug}`); continue; }

  // 1. Strip Term 3 sessions back off the Term 2 program (these were added earlier).
  const { data: removed, error: delErr } = await sb
    .from("sessions").delete().eq("program_id", src.id).gte("starts_at", TERM3_CUTOFF).select("id");
  if (delErr) throw delErr;
  console.log(`${slug}: removed ${removed?.length ?? 0} Term 3 sessions from the Term 2 program`);

  // 2. Create/upsert the separate Term 3 program.
  const t3slug = `${slug}-t3`;
  const fields = {
    type: "term", title: src.title, slug: t3slug, season: "Term 3 2026",
    skill_level: src.skill_level, age_min: src.age_min, age_max: src.age_max,
    default_capacity: src.default_capacity, status: "published",
    venue_id: src.venue_id, pricing_rule_id: src.pricing_rule_id,
  };
  const { data: existing } = await sb.from("programs").select("id").eq("slug", t3slug).maybeSingle();
  let t3id;
  if (existing) { await sb.from("programs").update(fields).eq("id", existing.id); t3id = existing.id; }
  else { const { data, error } = await sb.from("programs").insert(fields).select("id").single(); if (error) throw error; t3id = data.id; }

  // 3. Reconcile the Term 3 program's 10 Friday sessions.
  const dates = FRIDAYS.map((d) => ({ start: `${d}T${startT}`, end: `${d}T${endT}` }));
  const { data: have } = await sb.from("sessions").select("starts_at").eq("program_id", t3id).is("deleted_at", null);
  const haveSet = new Set((have || []).map((s) => Date.parse(s.starts_at)));
  const toInsert = dates.filter((d) => !haveSet.has(Date.parse(d.start)))
    .map((d) => ({ program_id: t3id, starts_at: d.start, ends_at: d.end, status: "scheduled" }));
  if (toInsert.length) { const { error } = await sb.from("sessions").insert(toInsert); if (error) throw error; }
  console.log(`   ${t3slug}: ${toInsert.length} Term 3 sessions inserted, ${(have || []).length} present`);
}
console.log("Done.");
