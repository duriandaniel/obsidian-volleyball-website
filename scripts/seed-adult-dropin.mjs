// Seed / reconcile adult drop-in social scrims ($20/night, Tue/Wed/Fri 7-9pm)
// against the live Supabase. Idempotent: safe to re-run.
//
//   node --env-file=.env.local scripts/seed-adult-dropin.mjs
//
// What it does:
//  - Ensures a $20 "Adult Drop-in" pricing rule.
//  - Ensures 3 adult programs (Tue/Wed/Fri) at Bennelong Sports Centre, age 18+,
//    pointed at the $20 rule.
//  - Reconciles each program's sessions to exactly the 4 target nights (7-9pm
//    Sydney = 09:00-11:00 UTC in June/July, AEST). Removes stray sessions that
//    have no bookings; inserts missing target nights.
//  - Archives the stale `term-2-2026-tuesday-juniors` so the junior funnel is a
//    single clean Friday/West Ryde group.

import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const BENNELONG = "22222222-2222-2222-2222-222222222222"; // West Ryde
const DROPIN_RULE_ID = "44444444-4444-4444-4444-444444444444";

const log = (...a) => console.log(...a);

// 7-9pm Sydney (AEST, UTC+10) -> 09:00-11:00 UTC. Dates are June/July 2026 (no DST).
const night = (isoDate) => ({
  starts_at: `${isoDate}T09:00:00+00:00`,
  ends_at: `${isoDate}T11:00:00+00:00`,
});

const ADULT_PROGRAMS = [
  {
    slug: "adult-scrim-tuesday-7pm",
    title: "Tuesday Adult Social Scrim",
    season: "Adult Social Scrim",
    dates: ["2026-06-09", "2026-06-16", "2026-06-23", "2026-06-30"],
  },
  {
    slug: "adult-scrim-wednesday-7pm",
    title: "Wednesday Adult Social Scrim",
    season: "Adult Social Scrim",
    dates: ["2026-06-10", "2026-06-17", "2026-06-24", "2026-07-01"],
  },
  {
    slug: "fri-adult-scrim-7pm", // existing row — reconcile in place
    title: "Friday Adult Social Scrim",
    season: "Adult Social Scrim",
    dates: ["2026-06-12", "2026-06-19", "2026-06-26", "2026-07-03"],
  },
];

async function ensurePricingRule() {
  const { data, error } = await sb
    .from("pricing_rules")
    .upsert(
      { id: DROPIN_RULE_ID, name: "Adult Drop-in $20", scope: "term", term_per_session_cents: 2000 },
      { onConflict: "id" }
    )
    .select("id")
    .single();
  if (error) throw error;
  log("pricing rule ok:", data.id, "($20/session)");
}

async function ensureProgram(p) {
  const row = {
    type: "term",
    title: p.title,
    slug: p.slug,
    season: p.season,
    description: null,
    venue_id: BENNELONG,
    default_capacity: 24,
    skill_level: "mixed",
    age_min: 18,
    age_max: 99,
    status: "published",
    pricing_rule_id: DROPIN_RULE_ID,
    refund_policy: "forfeit",
  };
  const { data, error } = await sb
    .from("programs")
    .upsert(row, { onConflict: "slug" })
    .select("id, slug")
    .single();
  if (error) throw error;
  log("program ok:", data.slug, data.id);
  return data.id;
}

async function reconcileSessions(programId, dates) {
  const targets = dates.map(night);
  const targetStarts = new Set(targets.map((t) => t.starts_at));

  const { data: existing, error } = await sb
    .from("sessions")
    .select("id, starts_at")
    .eq("program_id", programId)
    .is("deleted_at", null);
  if (error) throw error;

  // Normalise existing starts to the same +00:00 string for comparison
  const existingByStart = new Map();
  for (const s of existing ?? []) {
    const norm = new Date(s.starts_at).toISOString().replace(".000Z", "+00:00");
    existingByStart.set(norm, s.id);
  }

  // Remove sessions not in the target set (only if they carry no bookings)
  for (const s of existing ?? []) {
    const norm = new Date(s.starts_at).toISOString().replace(".000Z", "+00:00");
    if (!targetStarts.has(norm)) {
      const { count } = await sb
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("session_id", s.id)
        .is("deleted_at", null);
      if (count && count > 0) {
        log("   keep (has bookings):", s.starts_at);
        continue;
      }
      const { error: dErr } = await sb.from("sessions").delete().eq("id", s.id);
      if (dErr) throw dErr;
      log("   removed stray session:", s.starts_at);
    }
  }

  // Insert missing target nights
  const toInsert = targets
    .filter((t) => !existingByStart.has(t.starts_at))
    .map((t) => ({ program_id: programId, starts_at: t.starts_at, ends_at: t.ends_at, status: "scheduled" }));
  if (toInsert.length) {
    const { error: iErr } = await sb.from("sessions").insert(toInsert);
    if (iErr) throw iErr;
    log("   inserted", toInsert.length, "sessions");
  }
  log("   sessions now:", dates.join(", "));
}

async function archiveStaleJunior() {
  const { data, error } = await sb
    .from("programs")
    .update({ status: "archived" })
    .eq("slug", "term-2-2026-tuesday-juniors")
    .eq("status", "published")
    .select("slug");
  if (error) throw error;
  if (data?.length) log("archived stale program:", data[0].slug);
  else log("stale junior already archived / not found");
}

await ensurePricingRule();
for (const p of ADULT_PROGRAMS) {
  const id = await ensureProgram(p);
  await reconcileSessions(id, p.dates);
}
await archiveStaleJunior();
log("\nDONE.");
