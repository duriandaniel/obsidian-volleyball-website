import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

const Body = z.object({
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id: sessionId } = await ctx.params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Validate session exists
  const { data: session } = await sb
    .from("sessions")
    .select("id, starts_at, program_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const { data: program } = await sb
    .from("programs")
    .select("title")
    .eq("id", session.program_id)
    .maybeSingle();

  // Roster: all confirmed/pending/attended bookings for this session
  const { data: bookings } = await sb
    .from("bookings")
    .select("customer_id, participant_id")
    .eq("session_id", sessionId)
    .in("status", ["confirmed", "pending", "attended"])
    .is("deleted_at", null);
  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ error: "No parents to email — roster is empty" }, { status: 400 });
  }

  const customerIds = Array.from(new Set(bookings.map((b) => b.customer_id)));
  const participantIds = Array.from(new Set(bookings.map((b) => b.participant_id)));

  const [{ data: customers }, { data: participants }] = await Promise.all([
    sb.from("customers").select("id, email, first_name").in("id", customerIds),
    sb.from("participants").select("id, first_name").in("id", participantIds),
  ]);
  const custById = new Map((customers ?? []).map((c) => [c.id, c]));
  const partById = new Map((participants ?? []).map((p) => [p.id, p]));

  const dateStr = new Date(session.starts_at).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  });

  // Send emails — one per booking so each recipient gets the kid's first name personalised
  let sent = 0;
  let failed = 0;
  for (const b of bookings) {
    const cust = custById.get(b.customer_id);
    const part = partById.get(b.participant_id);
    if (!cust?.email) continue;

    const greeting = cust.first_name ? `Hi ${cust.first_name},` : "Hi,";
    const kidLine = part?.first_name ? `<p style="font-size: 12px; color: #666;">Re: ${part.first_name}'s booking on ${dateStr}.</p>` : "";

    try {
      await sendEmail({
        to: cust.email,
        subject: body.subject,
        template: "admin_broadcast",
        relatedBookingId: undefined,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <p>${greeting}</p>
            <div style="white-space: pre-line; line-height: 1.5;">${escapeHtml(body.message)}</div>
            ${kidLine}
            <p style="margin-top: 24px;">Thanks,<br>Obsidian Volleyball Academy</p>
          </div>
        `,
        text: `${greeting}\n\n${body.message}\n\nRe: ${program?.title ?? "your booking"} on ${dateStr}\n\n— Obsidian Volleyball Academy`,
      });
      sent++;
    } catch (err) {
      failed++;
      console.error("broadcast send failed", cust.email, err);
    }
  }

  await sb.from("audit_log").insert({
    actor_user_id: admin.auth_user_id,
    actor_email: admin.email,
    actor_role: admin.role,
    action: "session.broadcast",
    entity_type: "session",
    entity_id: sessionId,
    after: { subject: body.subject, recipients: customerIds.length, sent, failed },
  });

  return NextResponse.json({ sent, failed });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
