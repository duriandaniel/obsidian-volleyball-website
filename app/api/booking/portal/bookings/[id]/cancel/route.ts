import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentPortalCustomerId } from "@/lib/auth/portal";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";

const Body = z.object({ reason: z.string().max(2000).optional().nullable() });

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const customerId = await currentPortalCustomerId();
  if (!customerId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { id } = await ctx.params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    body = { reason: null };
  }

  const sb = supabaseAdmin();
  const { data: customer } = await sb
    .from("customers")
    .select("id, email, first_name")
    .eq("id", customerId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer) return NextResponse.json({ error: "Account not found" }, { status: 403 });

  const { data: booking } = await sb
    .from("bookings")
    .select("id, status, customer_id, session_id, participant_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.customer_id !== customer.id) return NextResponse.json({ error: "Not your booking" }, { status: 403 });
  if (booking.status === "cancelled") return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

  const { error } = await sb
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: "parent",
      cancellation_reason: body.reason || null,
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("audit_log").insert({
    actor_email: customer.email,
    actor_role: "parent",
    action: "booking.cancel",
    entity_type: "booking",
    entity_id: id,
    after: { reason: body.reason ?? null },
  });

  try {
    await sendEmail({
      to: customer.email,
      subject: "Cancellation received",
      template: "parent_cancel_confirmation",
      relatedBookingId: id,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #9B4FDE;">Cancellation received</h2>
          <p>Hi${customer.first_name ? ' ' + customer.first_name : ''},</p>
          <p>We've cancelled the booking. Our team will review and reach out about any refund decision shortly.</p>
          <p>If you have a significant reason for the cancellation (injury, family situation, etc.), reply to this email and we'll try to be reasonable.</p>
          <p>— Obsidian Volleyball Academy</p>
        </div>
      `,
    });
  } catch {
    // Don't block the cancel on email failure
  }

  return NextResponse.json({ ok: true });
}
