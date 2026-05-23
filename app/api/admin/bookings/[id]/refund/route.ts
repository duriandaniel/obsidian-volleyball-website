import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { sendEmail } from "@/lib/email/send";

const Body = z.object({
  action: z.enum(["refund", "decline"]),
  amount_cents: z.number().int().positive().nullable().optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await currentAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await ctx.params;
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: booking } = await sb
    .from("bookings")
    .select(
      "id, status, paid_amount_cents, stripe_payment_intent_id, refund_status, customer_id, participant_id, session_id"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (booking.status !== "cancelled") {
    return NextResponse.json({ error: "Booking is not cancelled" }, { status: 400 });
  }
  if (booking.refund_status === "issued") {
    return NextResponse.json({ error: "Already refunded" }, { status: 400 });
  }

  if (body.action === "decline") {
    await sb.from("bookings").update({ refund_status: "declined" }).eq("id", id);
    await sb.from("audit_log").insert({
      actor_user_id: admin.auth_user_id,
      actor_email: admin.email,
      actor_role: admin.role,
      action: "refund.decline",
      entity_type: "booking",
      entity_id: id,
    });
    return NextResponse.json({ ok: true });
  }

  // Refund action
  if (!body.amount_cents) {
    return NextResponse.json({ error: "Refund amount required" }, { status: 400 });
  }
  if (!booking.stripe_payment_intent_id) {
    return NextResponse.json({ error: "No Stripe payment to refund" }, { status: 400 });
  }
  if (booking.paid_amount_cents != null && body.amount_cents > booking.paid_amount_cents) {
    return NextResponse.json({ error: "Refund amount exceeds paid amount" }, { status: 400 });
  }

  try {
    const refund = await stripe().refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      amount: body.amount_cents,
    });
    await sb
      .from("bookings")
      .update({ refund_status: "issued", refund_amount_cents: body.amount_cents })
      .eq("id", id);

    await sb.from("audit_log").insert({
      actor_user_id: admin.auth_user_id,
      actor_email: admin.email,
      actor_role: admin.role,
      action: "refund.issue",
      entity_type: "booking",
      entity_id: id,
      after: { refund_id: refund.id, amount_cents: body.amount_cents },
    });

    // Send customer notification
    const { data: cust } = await sb
      .from("customers")
      .select("email, first_name")
      .eq("id", booking.customer_id)
      .maybeSingle();
    if (cust?.email) {
      try {
        await sendEmail({
          to: cust.email,
          subject: "Your refund from Obsidian Volleyball Academy",
          template: "refund_issued",
          relatedBookingId: id,
          html: `<p>Hi${cust.first_name ? ' ' + cust.first_name : ''},</p>
                 <p>We've issued a refund of $${(body.amount_cents / 100).toFixed(2)} to your card. It should appear in 5–10 business days.</p>
                 <p>Thanks,<br>Obsidian Volleyball Academy</p>`,
        });
      } catch {
        // Email failure shouldn't block the refund response
      }
    }

    return NextResponse.json({ ok: true, refund_id: refund.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe refund failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
