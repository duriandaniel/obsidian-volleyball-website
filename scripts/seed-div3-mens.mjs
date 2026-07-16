// Seed / reconcile the Div 3 Men's Training TRIAL ($20/night, Fri 7-9pm, West
// Ryde) against the live Supabase. Idempotent: safe to re-run.
//
//   node --env-file=.env.local scripts/seed-div3-mens.mjs
//
// Seeded as status='draft' on purpose: staging & prod share ONE Supabase, so a
// published row would appear on prod immediately. Draft + PREVIEW_DRAFT_PROGRAMS=1
// (Vercel Preview env only) makes it visible on STAGING for Dan to review, while
// prod (no flag) ignores it. Flip to 'published' at prod cutover.
//
// Phase 2 (8-week select squad) is intentionally NOT built here — it needs the
// team picked + squad price decided first.

import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const BENNELONG = "22222222-2222-2222-2222-222222222222"; // West Ryde
const DROPIN_RULE_ID = "44444444-4444-4444-4444-444444444444"; // shared $20/session rule

const log = (...a) => console.log(...a);

// 7-9pm Sydney (AEST, UTC+10) -> 09:00-11:00 UTC. Dates are July 2026 (no DST).
const night = (isoDate) => ({
  starts_at: `${isoDate}T09:00:00+00:00`,
  ends_at: `${isoDate}T11:00:00+00:00`,
});

const PROGRAM = {
  slug: "div-3-mens-trial",
  title: "Div 3 Men's Training — Trial",
  season: "Div 3 Men's",
  dates: ["2026-07-24", "2026-07-31"], // two Friday trial nights
};

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
    skill_level: "advanced",
    age_min: 18,
    age_max: 99,
    status: "draft", // staging-only until Dan approves; flip to 'published' for prod
    pricing_rule_id: DROPIN_RULE_ID,
    refund_policy: "forfeit",
  };
  const { data, error } = await sb
    .from("programs")
    .upsert(row, { onConflict: "slug" })
    .select("id, slug, status")
    .single();
  if (error) throw error;
  log("program ok:", data.slug, data.id, `(${data.status})`);
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

await ensurePricingRule();
const id = await ensureProgram(PROGRAM);
await reconcileSessions(id, PROGRAM.dates);
log("\nDONE. Trial is DRAFT — shows on staging (PREVIEW_DRAFT_PROGRAMS=1), hidden on prod.");
