import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { formatCents } from "@/lib/booking/pricing";
import { signPortalToken } from "@/lib/auth/portal";
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
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingType = session.metadata?.booking_type;
        if (bookingType === "term") {
          await handleTermCheckoutCompleted(session);
        } else if (bookingType === "dropin") {
          await handleDropinCheckoutCompleted(session);
        } else {
          await handleCheckoutCompleted(session);
        }
        break;
      }
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

  // Prefer customer/participant IDs from metadata (set by the pre-checkout form).
  // Fall back to legacy email-based lookup for sessions created before the form
  // was wired up (shouldn't happen post-rollout, but defensive).
  let customerId = session.metadata?.customer_id;
  let participantId = session.metadata?.participant_id;

  if (!customerId) {
    const { data: existing } = await sb
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase())
      .is("deleted_at", null)
      .maybeSingle();
    customerId = existing?.id;
    if (!customerId) {
      const [firstName, ...rest] = name.split(" ");
      const { data: inserted, error: cErr } = await sb
        .from("customers")
        .insert({
          email: email.toLowerCase(),
          first_name: firstName ?? null,
          last_name: rest.join(" ") || null,
        })
        .select("id")
        .single();
      if (cErr) throw cErr;
      customerId = inserted.id;
    }
  }

  // Attach the Stripe customer id if we got one
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (stripeCustomerId) {
    await sb.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);
  }

  if (!participantId) {
    const { data: existingParticipant } = await sb
      .from("participants")
      .select("id")
      .eq("customer_id", customerId)
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle();
    participantId = existingParticipant?.id;
    if (!participantId) {
      const { data: insertedP, error: pErr } = await sb
        .from("participants")
        .insert({ customer_id: customerId, first_name: "(pending)", last_name: "(pending)" })
        .select("id")
        .single();
      if (pErr) throw pErr;
      participantId = insertedP.id;
    }
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

  // Magic link so the parent can come back and manage this booking
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidian-booking-staging.vercel.app";
  const portalToken = signPortalToken(customerId!);
  const portalLink = `${appUrl}/api/booking/portal/access?token=${encodeURIComponent(portalToken)}`;

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
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
          Need to update your child's details, cancel, or reschedule?
          <a href="${portalLink}" style="display:inline-block; margin-top:8px; background:#9B4FDE; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:600;">Manage my bookings</a>
        </p>
        <p style="font-size: 12px; color: #666;">Or just reply to this email and we'll sort it out for you.</p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking ${programTitle}.\n\nDays: ${(sessionRows ?? [])
      .map((s) => new Date(s.starts_at).toLocaleDateString("en-AU", { dateStyle: "full", timeZone: "Australia/Sydney" }))
      .join(", ")}\n\nVenue: ${venueName}\nTime: 9:00 AM – 1:00 PM\nTotal paid: ${formatCents(total)}\n\nManage your booking: ${portalLink}\n\nOr just reply to this email with any questions.\n\nObsidian Volleyball Academy`,
  });
}

async function handleDropinCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const customerId = session.metadata?.customer_id;
  const participantId = session.metadata?.participant_id;
  const programId = session.metadata?.program_id;
  const sessionIdsJson = session.metadata?.session_ids;
  const perSessionCents = parseInt(session.metadata?.per_session_cents ?? "0", 10);
  const email = session.customer_details?.email ?? session.customer_email;

  if (!customerId || !participantId || !programId || !sessionIdsJson || !email) {
    throw new Error("Drop-in checkout missing required metadata");
  }
  const sessionIds: string[] = JSON.parse(sessionIdsJson);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Idempotency: skip if we've already created bookings for this payment.
  if (paymentIntentId) {
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .is("deleted_at", null);
    if (count && count > 0) return;
  }

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (stripeCustomerId) {
    await sb.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);
  }

  // One confirmed booking per chosen night. Drop-in scrims have no enrolment/order
  // row — the bookings carry the payment evidence directly. source='term' (the
  // only allowed value that fits a weekly class; 'dropin' would need a DB change).
  const paidAt = new Date().toISOString();
  const bookingsToInsert = sessionIds.map((session_id) => ({
    session_id,
    participant_id: participantId,
    customer_id: customerId,
    source: "term" as const,
    status: "confirmed" as const,
    paid_amount_cents: perSessionCents,
    stripe_payment_intent_id: paymentIntentId,
    paid_at: paidAt,
  }));
  const { error: bErr } = await sb.from("bookings").insert(bookingsToInsert);
  if (bErr) throw bErr;

  const total = session.amount_total ?? perSessionCents * sessionIds.length;
  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "dropin.create",
    entity_type: "program",
    entity_id: programId,
    after: { program_id: programId, nights: sessionIds.length, total_cents: total },
  });

  // Program + venue + session dates for the email
  const { data: program } = await sb.from("programs").select("title, venue_id").eq("id", programId).maybeSingle();
  let venueName = "Bennelong Sports Centre, West Ryde";
  if (program?.venue_id) {
    const { data: venue } = await sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle();
    if (venue) venueName = venue.address ? `${venue.name}, ${venue.address}` : venue.name;
  }
  const { data: sessionRows } = await sb
    .from("sessions")
    .select("starts_at, ends_at")
    .in("id", sessionIds)
    .order("starts_at");
  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney" });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
  const nightList = (sessionRows ?? [])
    .map((s) => `${fmtDay(s.starts_at)} · ${fmtTime(s.starts_at)} – ${fmtTime(s.ends_at)}`)
    .join("<br>");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidian-booking-staging.vercel.app";
  const portalToken = signPortalToken(customerId);
  const portalLink = `${appUrl}/api/booking/portal/access?token=${encodeURIComponent(portalToken)}`;
  const name = session.customer_details?.name ?? "";

  await sendEmail({
    to: email,
    subject: `Booking confirmed: ${program?.title ?? "Adult Social Scrim"}`,
    template: "dropin_booking_confirmation",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #9B4FDE; margin-bottom: 8px;">You're booked in.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for booking ${program?.title ?? "the social scrim"}. Here ${sessionIds.length === 1 ? "is your night" : "are your nights"}:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${nightList}</p>
        <p><strong>Venue:</strong> ${venueName}<br>
           <strong>Total paid:</strong> ${formatCents(total)} (${sessionIds.length} night${sessionIds.length === 1 ? "" : "s"})</p>
        <p>Bring water and indoor court shoes. See you on court.</p>
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
          <a href="${portalLink}" style="display:inline-block; background:#9B4FDE; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:600;">Manage my bookings</a>
        </p>
        <p style="font-size: 12px; color: #666;">Or just reply to this email with any questions.</p>
        <p>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking ${program?.title ?? "the social scrim"}.\n\nNights:\n${(sessionRows ?? [])
      .map((s) => `${fmtDay(s.starts_at)} ${fmtTime(s.starts_at)} - ${fmtTime(s.ends_at)}`)
      .join("\n")}\n\nVenue: ${venueName}\nTotal paid: ${formatCents(total)}\n\nManage your booking: ${portalLink}\n\nObsidian Volleyball Academy`,
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

async function handleTermCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const customerId = session.metadata?.customer_id;
  const participantId = session.metadata?.participant_id;
  const programId = session.metadata?.program_id;
  const sessionIdsJson = session.metadata?.session_ids;
  const perWeekCents = parseInt(session.metadata?.per_week_cents ?? "0", 10);
  const weeks = parseInt(session.metadata?.weeks ?? "0", 10);
  const email = session.customer_details?.email ?? session.customer_email;

  if (!customerId || !participantId || !programId || !sessionIdsJson || !email) {
    throw new Error("Term checkout missing required metadata");
  }
  const sessionIds: string[] = JSON.parse(sessionIdsJson);
  const total = session.amount_total ?? perWeekCents * weeks;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Idempotency: skip if we've already processed this Stripe session
  const { data: existingEnrolment } = await sb
    .from("enrolments")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existingEnrolment) return;

  // Attach Stripe customer id
  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (stripeCustomerId) {
    await sb.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);
  }

  // Create enrolment row
  const { data: enrolment, error: eErr } = await sb
    .from("enrolments")
    .insert({
      customer_id: customerId,
      participant_id: participantId,
      program_id: programId,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      weeks_paid: weeks,
      per_week_cents: perWeekCents,
      total_cents: total,
      status: "active",
      starts_on: new Date().toISOString().slice(0, 10),
      paid_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (eErr) throw eErr;

  // One booking per remaining session
  const bookingsToInsert = sessionIds.map((session_id) => ({
    session_id,
    participant_id: participantId,
    customer_id: customerId,
    source: "term" as const,
    enrolment_id: enrolment.id,
    status: "confirmed" as const,
    paid_amount_cents: perWeekCents,
    stripe_payment_intent_id: paymentIntentId,
    paid_at: new Date().toISOString(),
  }));
  const { error: bErr } = await sb.from("bookings").insert(bookingsToInsert);
  if (bErr) throw bErr;

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "enrolment.create",
    entity_type: "enrolment",
    entity_id: enrolment.id,
    after: { enrolment_id: enrolment.id, weeks, total_cents: total },
  });

  // Fetch program + venue for the confirmation email
  const { data: program } = await sb
    .from("programs")
    .select("title, venue_id")
    .eq("id", programId)
    .maybeSingle();
  let venueName = "Venue TBA";
  if (program?.venue_id) {
    const { data: venue } = await sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle();
    if (venue) venueName = venue.address ? `${venue.name}, ${venue.address}` : venue.name;
  }

  const { data: sessionRows } = await sb
    .from("sessions")
    .select("starts_at")
    .in("id", sessionIds)
    .order("starts_at");
  const dayList = (sessionRows ?? [])
    .map((s) =>
      new Date(s.starts_at).toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Australia/Sydney",
      })
    )
    .join("<br>");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidian-booking-staging.vercel.app";
  const portalToken = signPortalToken(customerId);
  const portalLink = `${appUrl}/api/booking/portal/access?token=${encodeURIComponent(portalToken)}`;

  const name = session.customer_details?.name ?? "";
  await sendEmail({
    to: email,
    subject: `Enrolment confirmed: ${program?.title ?? "Term program"}`,
    template: "term_enrolment_confirmation",
    relatedEnrolmentId: enrolment.id,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #9B4FDE;">You're enrolled.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for enrolling in ${program?.title ?? "the term program"}. Here are your sessions:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${dayList}</p>
        <p><strong>Venue:</strong> ${venueName}<br>
           <strong>Total paid:</strong> $${(total / 100).toFixed(2)} (${weeks} week${weeks === 1 ? "" : "s"} × $${(perWeekCents / 100).toFixed(2)})</p>
        <p>What to bring: water bottle, runners, snack. We provide all volleyball gear.</p>
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee;">
          <a href="${portalLink}" style="display:inline-block; background:#9B4FDE; color:white; padding:10px 16px; border-radius:6px; text-decoration:none; font-weight:600;">Manage my bookings</a>
        </p>
        <p style="font-size: 12px; color: #666;">Or just reply to this email and we'll help you out.</p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're enrolled in ${program?.title ?? "the term program"}.\n\nSessions: ${(sessionRows ?? []).length} weeks\nVenue: ${venueName}\nTotal paid: $${(total / 100).toFixed(2)}\n\nManage your enrolment: ${portalLink}\n\nObsidian Volleyball Academy`,
  });
}
