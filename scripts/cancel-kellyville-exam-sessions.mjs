// Cancel the 8 Kellyville Term 3 2026 sessions that clash with Kellyville High
// School exam dates (venue unavailable). Sets sessions.status = 'cancelled' and
// a human note; the enrol page renders these dates struck-through and the
// checkout routes (all filter status='scheduled') stop charging/booking new
// users for them. EXISTING bookings are left untouched — refunds/emails to the
// ~25 already-enrolled families are handled manually by the OVA team.
//
// Reads .env.local, which points at PROD Supabase (see project memory), so this
// affects live data. Reversible.
//
// Usage:
//   node scripts/cancel-kellyville-exam-sessions.mjs           # dry-run (default)
//   node scripts/cancel-kellyville-exam-sessions.mjs --apply   # set cancelled
//   node scripts/cancel-kellyville-exam-sessions.mjs --revert  # restore to scheduled

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const NOTE = "Kellyville HS exams";
const TARGETS = {
  "tue-beginners-4pm": ["2026-08-04", "2026-08-11", "2026-09-01", "2026-09-08"],
  "wed-intermediate-4pm": ["2026-08-05", "2026-08-12", "2026-09-02", "2026-09-09"],
};

const mode = process.argv.includes("--apply") ? "apply" : process.argv.includes("--revert") ? "revert" : "dry-run";
const dateAU = (iso) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" }); // yyyy-mm-dd

console.log(`\nMode: ${mode.toUpperCase()}  (note="${NOTE}")\n`);
let changed = 0;
let mismatches = 0;

for (const [slug, dates] of Object.entries(TARGETS)) {
  const { data: prog } = await sb
    .from("programs")
    .select("id, title")
    .eq("slug", slug)
    .eq("type", "term")
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();
  if (!prog) {
    console.log(`⚠ program not found for slug ${slug} — skipping`);
    mismatches++;
    continue;
  }
  console.log(`${slug} — ${prog.title}`);

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, status, notes")
    .eq("program_id", prog.id)
    .is("deleted_at", null)
    .order("starts_at");

  for (const target of dates) {
    const matches = (sessions ?? []).filter((s) => dateAU(s.starts_at) === target);
    if (matches.length !== 1) {
      console.log(`  ⚠ ${target}: expected 1 session, found ${matches.length} — SKIPPED`);
      mismatches++;
      continue;
    }
    const s = matches[0];
    const wantStatus = mode === "revert" ? "scheduled" : "cancelled";
    const wantNotes = mode === "revert" ? null : NOTE;

    // count active bookings, for visibility only
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("session_id", s.id)
      .in("status", ["confirmed", "pending", "attended"])
      .is("deleted_at", null);

    if (s.status === wantStatus && (s.notes ?? null) === wantNotes) {
      console.log(`  = ${target}: already ${wantStatus} (${count ?? 0} active bookings) — no change`);
      continue;
    }

    if (mode === "dry-run") {
      console.log(`  → ${target}: ${s.status} → ${wantStatus} (${count ?? 0} active bookings) [dry-run]`);
      changed++;
      continue;
    }

    const { error } = await sb.from("sessions").update({ status: wantStatus, notes: wantNotes }).eq("id", s.id);
    if (error) {
      console.log(`  ✗ ${target}: update failed — ${error.message}`);
      mismatches++;
    } else {
      console.log(`  ✓ ${target}: ${s.status} → ${wantStatus} (${count ?? 0} active bookings)`);
      changed++;
    }
  }
}

console.log(`\n${changed} session(s) ${mode === "dry-run" ? "would change" : "changed"}, ${mismatches} problem(s).`);
if (mode === "dry-run") console.log("Re-run with --apply to cancel, or --revert to restore.\n");
