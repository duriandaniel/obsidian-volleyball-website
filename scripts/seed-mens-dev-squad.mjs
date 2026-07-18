// Seed / reconcile the Men's Development Squad (Winter '26 Batch) against the
// live Supabase. Idempotent: safe to re-run. Patterned on seed-adult-dropin.mjs.
//
//   node --env-file=.env.local scripts/seed-mens-dev-squad.mjs
//
// Two linked programs, both 18+ at Bennelong (West Ryde), Fri 7-9pm:
//   1. TRIAL  — 2 nights, $15/session drop-in, cap 42, PUBLIC (positional tryout).
//   2. SQUAD  — 8 wks, $216 all-in block ($27/wk incl. shirt), cap 21, UNLISTED
//               (offer-only, private enrol link).
//
// Both seed as status='draft' so they show on STAGING only (PREVIEW_DRAFT_PROGRAMS=1
// in Vercel Preview env) while Dan reviews — staging & prod share one Supabase, so a
// published row would hit prod instantly. Flip the TRIAL to 'published' at prod
// cutover; the SQUAD stays unlisted/offer-only (its enrol flow is built separately).

import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const BENNELONG = "22222222-2222-2222-2222-222222222222"; // West Ryde
const TRIAL_RULE_ID = "15151515-1515-1515-1515-151515151515"; // $15/session
const SQUAD_RULE_ID = "27272727-2727-2727-2727-272727272727"; // $27/wk -> $216 / 8wks

const log = (...a) => console.log(...a);

// 7-9pm Sydney (AEST, UTC+10) -> 09:00-11:00 UTC. Jul-Sep 2026 (no DST).
const night = (isoDate) => ({
  starts_at: `${isoDate}T09:00:00+00:00`,
  ends_at: `${isoDate}T11:00:00+00:00`,
});

const RULES = [
  { id: TRIAL_RULE_ID, name: "Men's Squad Trial $15", scope: "term", term_per_session_cents: 1500 },
  { id: SQUAD_RULE_ID, name: "Men's Squad Winter'26 $27/wk", scope: "term", term_per_session_cents: 2700 },
];

const PROGRAMS = [
  {
    slug: "mens-dev-squad-trial",
    title: "Men's Development Squad — Trial",
    season: "Winter '26 Batch",
    default_capacity: 42,
    pricing_rule_id: TRIAL_RULE_ID,
    dates: ["2026-07-24", "2026-07-31"],
  },
  {
    slug: "mens-dev-squad-winter26",
    title: "Men's Development Squad — Winter '26",
    season: "Winter '26 Batch",
    default_capacity: 21,
    pricing_rule_id: SQUAD_RULE_ID,
    dates: [
      "2026-08-07",
      "2026-08-14",
      "2026-08-21",
      "2026-08-28",
      "2026-09-04",
      "2026-09-11",
      "2026-09-18",
      "2026-09-25",
    ],
  },
];

async function ensureRules() {
  for (const r of RULES) {
    const { error } = await sb.from("pricing_rules").upsert(r, { onConflict: "id" });
    if (error) throw error;
    log("pricing rule ok:", r.name, `($${(r.term_per_session_cents / 100).toFixed(0)}/session)`);
  }
}

async function ensureProgram(p) {
  const row = {
    type: "term",
    title: p.title,
    slug: p.slug,
    season: p.season,
    description: null,
    venue_id: BENNELONG,
    default_capacity: p.default_capacity,
    skill_level: "advanced",
    age_min: 18,
    age_max: 99,
    status: "draft", // staging-only until cutover; trial -> published, squad stays unlisted
    pricing_rule_id: p.pricing_rule_id,
    refund_policy: "forfeit", // non-refundable
  };
  const { data, error } = await sb
    .from("programs")
    .upsert(row, { onConflict: "slug" })
    .select("id, slug, status")
    .single();
  if (error) throw error;
  log("program ok:", data.slug, data.id, `(${data.status}, cap ${p.default_capacity})`);
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
      await sb.from("sessions").delete().eq("id", s.id);
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

// Remove the earlier throwaway draft from the first pass (no bookings expected).
async function dropOldDraft() {
  const { data: prog } = await sb
    .from("programs")
    .select("id, status")
    .eq("slug", "div-3-mens-trial")
    .maybeSingle();
  if (!prog) return;
  if (prog.status !== "draft") {
    log("skip cleanup: div-3-mens-trial is", prog.status, "(not draft) — leaving it");
    return;
  }
  const { count } = await sb
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .in(
      "session_id",
      (await sb.from("sessions").select("id").eq("program_id", prog.id)).data?.map((s) => s.id) ?? ["none"]
    )
    .is("deleted_at", null);
  if (count && count > 0) {
    log("skip cleanup: div-3-mens-trial has bookings");
    return;
  }
  await sb.from("sessions").delete().eq("program_id", prog.id);
  await sb.from("programs").delete().eq("id", prog.id);
  log("cleaned up old draft: div-3-mens-trial");
}

await ensureRules();
for (const p of PROGRAMS) {
  const id = await ensureProgram(p);
  await reconcileSessions(id, p.dates);
}
await dropOldDraft();
log("\nDONE. Both DRAFT — trial + squad show on staging only (PREVIEW_DRAFT_PROGRAMS=1).");
