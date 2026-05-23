import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { formatCents } from "@/lib/booking/pricing";
import type Stripe from "stripe";

// Stripe webhook needs the raw body to verify the signature.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook verification failed: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "charge.refunded":
        await handleRefund(event.data.object);
        break;
      default:
        // Acknowledge events we don't act on so Stripe doesn't retry
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    // Return 500 so Stripe retries
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const bookingType = session.metadata?.booking_type;
  if (bookingType !== "camp") {
    // Term enrolment handling will live here too; not implemented yet.
    return;
  }

  const itemsJson = session.metadata?.items;
  if (!itemsJson) {
    throw new Error("Camp checkout session missing items metadata");
  }
  const items: { session_id: string; is_half_day: boolean }[] = JSON.parse(itemsJson);

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) throw new Error("Checkout missing customer email");
  const name = session.customer_details?.name ?? "";
  const phone = session.customer_details?.phone ?? null;

  // Upsert customer by email
  const { data: existing } = await sb
    .from("customers")
    .select("id")
    .eq("email", email.toLowerCase())
    .is("deleted_at", null)
    .maybeSingle();

  let customerId = existing?.id as string | undefined;
  if (!customerId) {
    const [firstName, ...rest] = name.split(" ");
    const { data: inserted, error: cErr } = await sb
      .from("customers")
      .insert({
        email: email.toLowerCase(),
        first_name: firstName ?? null,
        last_name: rest.join(" ") || null,
        phone,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
      })
      .select("id")
      .single();
    if (cErr) throw cErr;
    customerId = inserted.id;
  }

  // For v1, create a placeholder participant from the parent's details.
  // The success page collects real kid details after redirect.
  const { data: existingParticipant } = await sb
    .from("participants")
    .select("id")
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();

  let participantId = existingParticipant?.id as string | undefined;
  if (!participantId) {
    const { data: insertedP, error: pErr } = await sb
      .from("participants")
      .insert({
        customer_id: customerId,
        first_name: "(pending)",
        last_name: "(pending)",
      })
      .select("id")
      .single();
    if (pErr) throw pErr;
    participantId = insertedP.id;
  }

  // Idempotency: if we've already processed this Stripe session, do nothing.
  const { data: existingOrder } = await sb
    .from("camp_orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existingOrder) return;

  // Create camp_order
  const total = session.amount_total ?? 0;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const { data: order, error: oErr } = await sb
    .from("camp_orders")
    .insert({
      customer_id: customerId,
      participant_id: participantId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      subtotal_cents: total,
      discount_cents: 0,
      total_cents: total,
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (oErr) throw oErr;

  // Create one booking per session
  const bookingsToInsert = items.map((item) => ({
    session_id: item.session_id,
    participant_id: participantId,
    customer_id: customerId,
    source: "camp" as const,
    camp_order_id: order.id,
    status: "confirmed" as const,
    paid_amount_cents: Math.floor(total / items.length),
    stripe_payment_intent_id: paymentIntentId,
    paid_at: new Date().toISOString(),
  }));

  const { error: bErr } = await sb.from("bookings").insert(bookingsToInsert);
  if (bErr) {
    // Capacity violation will throw here — log and rethrow
    throw bErr;
  }

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "camp_order.create",
    entity_type: "camp_order",
    entity_id: order.id,
    after: { camp_order_id: order.id, session_count: items.length, total_cents: total },
  });

  // Fetch session details for the confirmation email
  const sessionIds = items.map((i) => i.session_id);
  const { data: sessionRows } = await sb
    .from("sessions")
    .select("starts_at, ends_at, program_id")
    .in("id", sessionIds);

  const programId = sessionRows?.[0]?.program_id;
  let venueName = "Baulkham Hills High School";
  let programTitle = "Obsidian Holiday Camp";
  if (programId) {
    const { data: prog } = await sb
      .from("programs")
      .select("title, venue_id")
      .eq("id", programId)
      .maybeSingle();
    if (prog) {
      programTitle = prog.title;
      const { data: ven } = await sb
        .from("venues")
        .select("name, address")
        .eq("id", prog.venue_id)
        .maybeSingle();
      if (ven) venueName = ven.address ? `${ven.name}, ${ven.address}` : ven.name;
    }
  }

  const dayList = (sessionRows ?? [])
    .map((s) =>
      new Date(s.starts_at).toLocaleDateString("en-AU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Australia/Sydney",
      })
    )
    .join("<br>");

  await sendEmail({
    to: email,
    subject: `Booking confirmed: ${programTitle}`,
    template: "camp_booking_confirmation",
    relatedCampOrderId: order.id,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #9B4FDE; margin-bottom: 8px;">You're booked in.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for booking ${programTitle}. Here are your days:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${dayList}</p>
        <p><strong>Venue:</strong> ${venueName}<br>
           <strong>Time:</strong> 9:00 AM – 1:00 PM<br>
           <strong>Total paid:</strong> ${formatCents(total)}</p>
        <p>What to bring: water bottle, runners, snack. We provide all volleyball gear.</p>
        <p>If you need to update your child's details (school, level, medical notes) or have any questions, just reply to this email.</p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking ${programTitle}. Days: ${(sessionRows ?? [])
      .map((s) => new Date(s.starts_at).toLocaleDateString("en-AU", { dateStyle: "full", timeZone: "Australia/Sydney" }))
      .join(", ")}\n\nVenue: ${venueName}\nTime: 9:00 AM – 1:00 PM\nTotal paid: ${formatCents(total)}\n\nReply to this email with any questions.\n\nObsidian Volleyball Academy`,
  });
}

async function handleRefund(charge: Stripe.Charge) {
  const sb = supabaseAdmin();
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : null;
  if (!paymentIntentId) return;

  await sb
    .from("camp_orders")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId);

  await sb
    .from("bookings")
    .update({ refund_status: "issued", refund_amount_cents: charge.amount_refunded })
    .eq("stripe_payment_intent_id", paymentIntentId);

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "refund.processed",
    entity_type: "payment_intent",
    entity_id: null,
    after: { payment_intent_id: paymentIntentId, refunded_cents: charge.amount_refunded },
  });
}
