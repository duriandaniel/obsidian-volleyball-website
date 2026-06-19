// Seed West Ryde Term 3 2026 Friday sessions onto the existing programs.
// Idempotent: safe to re-run (reconciles sessions by timestamp).
//   node --env-file=.env.local scripts/seed-westryde-term3.mjs
import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Term 3 2026 Fridays (AEST = UTC+10, no DST until October).
const FRIDAYS = ["2026-07-24","2026-07-31","2026-08-07","2026-08-14","2026-08-21","2026-08-28","2026-09-04","2026-09-11","2026-09-18","2026-09-25"];

// slug -> [startUTC, endUTC] for that class's time slot.
const SLOTS = {
  "fri-beginners-4pm": ["06:00:00+00:00", "07:30:00+00:00"],      // 4:00–5:30pm AEST
  "fri-intermediate-4pm": ["06:00:00+00:00", "07:30:00+00:00"],   // 4:00–5:30pm AEST
  "fri-intermediate-530pm": ["07:30:00+00:00", "09:00:00+00:00"], // 5:30–7:00pm AEST
  "fri-advanced-530pm": ["07:30:00+00:00", "09:00:00+00:00"],     // 5:30–7:00pm AEST
};

async function reconcile(slug, [startT, endT]) {
  const { data: program } = await sb.from("programs").select("id").eq("slug", slug).maybeSingle();
  if (!program) { console.log(`! program not found: ${slug}`); return; }
  const dates = FRIDAYS.map((d) => ({ start: `${d}T${startT}`, end: `${d}T${endT}` }));
  const { data: existing } = await sb.from("sessions").select("starts_at").eq("program_id", program.id).is("deleted_at", null);
  const have = new Set((existing || []).map((s) => Date.parse(s.starts_at)));
  const toInsert = dates
    .filter((d) => !have.has(Date.parse(d.start)))
    .map((d) => ({ program_id: program.id, starts_at: d.start, ends_at: d.end, status: "scheduled" }));
  if (toInsert.length) {
    const { error } = await sb.from("sessions").insert(toInsert);
    if (error) throw error;
  }
  console.log(`${slug}: ${toInsert.length} inserted, ${(existing || []).length} already present`);
}

for (const [slug, slot] of Object.entries(SLOTS)) {
  await reconcile(slug, slot);
}
console.log("Done.");
