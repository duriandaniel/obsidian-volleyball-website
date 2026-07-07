import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { notifyWaitlistOpenings } from "@/lib/booking/waitlist";

// Admin-triggered waitlist notification, called by the ova-dash dashboard.
//
// Flow: when an admin cancels a player's booking (with OR without a refund —
// a cancelled player isn't coming, so the spot is resellable either way), the
// dashboard prompts "email the waitlist?". If confirmed, it calls this
// endpoint with the freed session ids. Nothing is ever sent automatically.
//
// For each upcoming session, the top 5 active waitlist entries (oldest first,
// not converted, not deleted) are emailed and notified_at is stamped. People
// can be re-notified on later openings — spots are first-come first-served.
//
// Auth: shared secret. Send `Authorization: Bearer ${WAITLIST_NOTIFY_SECRET}`;
// the same value must be configured in both this project's and ova-dash's env.
export const dynamic = "force-dynamic";
// Fan-out over SMTP (sessions × 5 recipients) can be slow.
export const maxDuration = 60;

const Body = z.object({
  session_ids: z.array(z.string().uuid()).min(1).max(50),
  // Free-text context for the audit log, e.g. "admin cancel, no refund".
  reason: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const secret = process.env.WAITLIST_NOTIFY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Waitlist notify not configured" }, { status: 503 });
  }
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid request: ${msg}` }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const summary = await notifyWaitlistOpenings(sb, body.session_ids, body.reason ?? "admin cancel");

  // sessions in the past (or unknown ids) are skipped and absent from summary
  return NextResponse.json({ ok: true, notified: summary });
}
