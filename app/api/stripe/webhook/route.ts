import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { sendMetaPurchase } from "@/lib/meta/capi";
import { formatCents, priceCampFullDays, CAMP_HALF_DAY_CENTS } from "@/lib/booking/pricing";
import { readChunked } from "@/lib/booking/metadata";
import { addToWaitlist, escHtml, isOnWaitlist, markWaitlistConverted } from "@/lib/booking/waitlist";
import type Stripe from "stripe";

// Stripe webhook needs the raw body to verify the signature.
export const dynamic = "force-dynamic";
// Headroom for the slower paths (Stripe capture/cancel round-trips + SMTP).
export const maxDuration = 60;

// Per-venue Google Maps links. Venue name comes from the DB, so this stays
// correct across venues — only venues we have a map for get a link.
const VENUE_MAPS: { match: RegExp; url: string }[] = [
  { match: /west ryde/i, url: "https://maps.app.goo.gl/eByotpKjs2mcs4AL8" },
  { match: /kellyville/i, url: "https://www.google.com/maps/search/?api=1&query=Kellyville+High+School" },
];
function venueHtml(name: string): string {
  const m = VENUE_MAPS.find((v) => v.match.test(name));
  return m ? `<a href="${m.url}" style="color:#7E57C2;">${name}</a>` : name;
}

// WhatsApp group invites. Fill these in to switch the join links on; empty =
// the line is omitted from the email.
const WHATSAPP_PARENTS_URL = "https://chat.whatsapp.com/HYlStwL25fMJaXpl7hWkbU";
const WHATSAPP_ADULTS_URL = "https://chat.whatsapp.com/CswUk6K61IE1N3sOxmAWbg";
function whatsappHtml(url: string, who: string): string {
  return url
    ? `<p style="font-size: 13px; color: #666;">Join the ${who} WhatsApp group for updates and reminders: <a href="${url}" style="color:#7E57C2;">tap to join</a>.</p>`
    : "";
}

// Record an optional jersey purchase in the context-agnostic jersey_orders table.
// Best-effort: a missing jersey, missing table, or a duplicate (idempotent index)
// never blocks the booking. The jersey is always captured in Stripe regardless.
async function recordJerseyOrder(
  sb: ReturnType<typeof supabaseAdmin>,
  session: Stripe.Checkout.Session,
  opts: {
    customerId: string;
    participantId: string | null;
    context: "camp" | "term" | "standalone";
    campOrderId?: string | null;
    enrolmentId?: string | null;
    paymentIntentId: string | null;
    quantity?: number;
  }
) {
  const sizeMeta = session.metadata?.jersey_size;
  const size = sizeMeta && sizeMeta !== "none" ? sizeMeta : null;
  if (!size) return;
  const amount = parseInt(session.metadata?.jersey_cents ?? "0", 10) || 0;
  const { error } = await sb.from("jersey_orders").insert({
    customer_id: opts.customerId,
    participant_id: opts.participantId,
    size,
    quantity: opts.quantity ?? 1,
    amount_cents: amount,
    context: opts.context,
    camp_order_id: opts.campOrderId ?? null,
    enrolment_id: opts.enrolmentId ?? null,
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: opts.paymentIntentId,
    status: "paid",
    paid_at: new Date().toISOString(),
  });
  if (error) console.warn("jersey_orders insert skipped:", error.message);
}

// ============================================================
// Manual-capture payment helpers
// Booking checkouts authorize the card (capture_method: manual); money only
// moves once the booking rows insert cleanly past the DB capacity trigger.
// ============================================================

// True if a bookings insert failed on the capacity trigger — i.e. the last
// spot was taken by a concurrent booking between checkout start and webhook
// delivery (waitlist notifications go to several parents at once, so this
// race is expected, not exceptional).
function isCapacityError(err: { code?: string; message?: string } | null): boolean {
  return !!err && (err.code === "23514" || /at capacity/i.test(err.message ?? ""));
}

// Capture an authorized payment. Idempotent: no-op if already captured (or if
// the checkout predates manual capture and auto-captured, or the auth was
// cancelled). Called on every success AND idempotency-early-return path, so a
// webhook retry after a failed capture still captures.
async function ensureCaptured(paymentIntentId: string | null) {
  if (!paymentIntentId) return;
  const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status === "requires_capture") {
    await stripe().paymentIntents.capture(paymentIntentId);
  }
}

// True if the auth was already released (event re-delivered after a lost
// capacity race). Booking types without their own idempotency row (dropin,
// casual, trial) must check this before inserting — capacity may have freed up
// since, and inserting would confirm a booking nobody paid for.
async function paymentAlreadyReleased(paymentIntentId: string | null): Promise<boolean> {
  if (!paymentIntentId) return false;
  const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  return pi.status === "canceled";
}

// Race lost: release the money. Cancel the auth if uncaptured (the card is
// never charged); fall back to a full refund for legacy auto-capture checkout
// sessions still in flight at deploy time.
async function releasePayment(paymentIntentId: string): Promise<"released" | "refunded"> {
  const pi = await stripe().paymentIntents.retrieve(paymentIntentId);
  if (pi.status === "requires_capture") {
    await stripe().paymentIntents.cancel(paymentIntentId, { cancellation_reason: "abandoned" });
    return "released";
  }
  if (pi.status === "succeeded") {
    await stripe().refunds.create({ payment_intent: paymentIntentId });
    return "refunded";
  }
  return "released"; // already canceled / nothing captured — nothing to release
}

// Kid's name for the waitlist row (nice for the dashboard); best-effort.
async function participantName(
  sb: ReturnType<typeof supabaseAdmin>,
  participantId: string | null | undefined
): Promise<string | null> {
  if (!participantId) return null;
  const { data } = await sb
    .from("participants")
    .select("first_name, last_name")
    .eq("id", participantId)
    .maybeSingle();
  const name = data ? `${data.first_name} ${data.last_name}`.trim() : null;
  return name && !name.includes("(pending)") ? name : null;
}

// The payment lost the capacity race: release the money, keep (or put) them on
// the waitlist, log it, and send the apology email. Never throws for email
// failures — the money release is the part that must not be lost, and it
// happens first (a throw there 500s the webhook so Stripe retries the release).
async function handleCapacityRaceLoss(
  sb: ReturnType<typeof supabaseAdmin>,
  opts: {
    paymentIntentId: string | null;
    email: string | null;
    name: string;
    phone: string | null;
    kidName?: string | null;
    sessionIds: string[]; // sessions in the failed booking (for the waitlist check)
    waitlistSessionIds?: string[]; // sessions to add them to if not already listed (defaults to sessionIds)
    bookingType: string;
    errMessage: string;
  }
) {
  let release: "released" | "refunded" | "none" = "none";
  if (opts.paymentIntentId) {
    release = await releasePayment(opts.paymentIntentId); // throws → Stripe retries
  }

  // Keep them first in line: if they weren't already waitlisted, add them now.
  let wasOnWaitlist = false;
  if (opts.email) {
    try {
      wasOnWaitlist = await isOnWaitlist(sb, opts.email, opts.sessionIds);
      if (!wasOnWaitlist) {
        await addToWaitlist(sb, {
          sessionIds: opts.waitlistSessionIds ?? opts.sessionIds,
          customerName: opts.name || opts.email,
          kidName: opts.kidName ?? null,
          email: opts.email,
          phone: opts.phone,
        });
      }
    } catch (err) {
      console.error("capacity race: waitlist upsert failed", err);
    }
  }

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "booking.capacity_race_lost",
    entity_type: "payment_intent",
    entity_id: null,
    after: {
      payment_intent_id: opts.paymentIntentId,
      booking_type: opts.bookingType,
      session_ids: opts.sessionIds,
      email: opts.email,
      payment: release,
      was_on_waitlist: wasOnWaitlist,
      error: opts.errMessage,
    },
  });

  if (!opts.email) return;
  const firstName = (opts.name || "").split(" ")[0];
  const moneyHtml =
    release === "refunded"
      ? "you've been <strong>refunded in full</strong> — the money will be back on your card within a few business days"
      : "your card was <strong>not charged</strong> — the pending authorisation will drop off your statement within a day or two";
  const moneyText =
    release === "refunded"
      ? "you've been refunded in full — the money will be back on your card within a few business days"
      : "your card was NOT charged — the pending authorisation will drop off your statement within a day or two";
  const waitlistLine = wasOnWaitlist
    ? "You're still at the top of the waitlist, so you'll be first to hear if another spot opens."
    : "We've put you on the waitlist, so you'll be first to hear if another spot opens.";
  try {
    await sendEmail({
      to: opts.email,
      subject: "That last spot was snapped up — you haven't been charged",
      template: "booking_capacity_apology",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #7E57C2; margin-bottom: 8px;">We're really sorry.</h2>
          <p>Hi${firstName ? " " + escHtml(firstName) : ""},</p>
          <p>The last spot was snapped up moments before your payment went through, so we couldn't complete your booking. The good news: ${moneyHtml}.</p>
          <p>${waitlistLine} Spots are first-come, first-served, so if you get that email, book quickly.</p>
          <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
            Questions? Just reply to this email and we'll sort it out.
          </p>
          <p>Obsidian Volleyball Academy</p>
        </div>
      `,
      text: `We're really sorry.\n\nThe last spot was snapped up moments before your payment went through, so we couldn't complete your booking. The good news: ${moneyText}.\n\n${waitlistLine} Spots are first-come, first-served, so if you get that email, book quickly.\n\nQuestions? Just reply to this email.\n\nObsidian Volleyball Academy`,
    });
  } catch (err) {
    console.error("capacity race: apology email failed", err);
  }
}

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
        } else if (bookingType === "trial") {
          await handleTrialCheckoutCompleted(session);
        } else if (bookingType === "casual") {
          await handleCasualCheckoutCompleted(session);
        } else if (bookingType === "jersey") {
          await handleJerseyCheckoutCompleted(session);
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

  // Session list moved from a single `items` JSON value (which overflowed
  // Stripe's 500-char metadata limit for big carts) to chunked `session_ids` +
  // a `half_days` bitstring. Read the legacy shape too for any in-flight session.
  let items: { session_id: string; is_half_day: boolean }[];
  const legacyItems = session.metadata?.items;
  if (legacyItems) {
    items = JSON.parse(legacyItems);
  } else {
    const ids = readChunked(session.metadata, "session_ids").split(",").filter(Boolean);
    const halfDays = session.metadata?.half_days ?? "";
    items = ids.map((session_id, i) => ({ session_id, is_half_day: halfDays[i] === "1" }));
  }
  if (items.length === 0) {
    throw new Error("Camp checkout session missing session_ids metadata");
  }

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

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Idempotency: if we've already processed this Stripe session, just make
  // sure the authorized payment was captured (a retry may land here after the
  // bookings inserted but before capture completed).
  const { data: existingOrder } = await sb
    .from("camp_orders")
    .select("id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existingOrder) {
    if (existingOrder.status === "paid") await ensureCaptured(paymentIntentId);
    // Cancelled = a lost capacity race. releasePayment may have thrown after
    // the order was voided (Stripe blip); it's idempotent, so re-run it on
    // every redelivery to guarantee the money is actually released.
    else if (existingOrder.status === "cancelled" && paymentIntentId) await releasePayment(paymentIntentId);
    return;
  }

  // Create camp_order
  const total = session.amount_total ?? 0; // includes jersey add-on, reflects any promo discount
  const jerseyCents = parseInt(session.metadata?.jersey_cents ?? "0", 10) || 0;
  const jerseySize =
    session.metadata?.jersey_size && session.metadata.jersey_size !== "none"
      ? session.metadata.jersey_size
      : null;
  // Camp-only portion (exclude the jersey) for the per-booking amount.
  const campPortion = Math.max(0, total - jerseyCents);

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

  // Record the optional jersey add-on (camp context).
  await recordJerseyOrder(sb, session, {
    customerId: customerId!,
    participantId: participantId ?? null,
    context: "camp",
    campOrderId: order.id,
    paymentIntentId,
  });

  // Create one booking per session. paid_amount_cents is allocated per day by
  // what each day actually costs — half days at the flat half-day rate, full
  // days sharing the ladder price — scaled so the rows sum exactly to the camp
  // portion paid (promo codes shrink it proportionally). The old flat average
  // blended half and full days together, which made per-day revenue wrong and
  // erased the half-day signal from the amounts.
  const fullCount = items.filter((i) => !i.is_half_day).length;
  const fullDayEach = fullCount ? priceCampFullDays(fullCount) / fullCount : 0;
  const weights = items.map((i) => (i.is_half_day ? CAMP_HALF_DAY_CENTS : fullDayEach));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  let allocated = 0;
  const bookingsToInsert = items.map((item, i) => {
    const cents =
      i === items.length - 1
        ? campPortion - allocated // last row absorbs rounding so the sum is exact
        : Math.floor(weightSum ? (campPortion * weights[i]) / weightSum : campPortion / items.length);
    allocated += cents;
    return {
      session_id: item.session_id,
      participant_id: participantId,
      customer_id: customerId,
      source: "camp" as const,
      camp_order_id: order.id,
      status: "confirmed" as const,
      is_half_day: item.is_half_day,
      paid_amount_cents: cents,
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
    };
  });

  const { data: insertedBookings, error: bErr } = await sb
    .from("bookings")
    .insert(bookingsToInsert)
    .select("id, session_id");
  if (bErr) {
    if (isCapacityError(bErr)) {
      // Lost the last-spot race. The card was only authorized, not captured:
      // release it, void the order, apologise, keep them on the waitlist.
      await sb
        .from("camp_orders")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", order.id);
      await handleCapacityRaceLoss(sb, {
        paymentIntentId,
        email,
        name,
        phone: session.customer_details?.phone ?? null,
        kidName: await participantName(sb, participantId),
        sessionIds: items.map((i) => i.session_id),
        bookingType: "camp",
        errMessage: bErr.message,
      });
      return;
    }
    throw bErr;
  }

  // Bookings are in — NOW take the money.
  await ensureCaptured(paymentIntentId);
  await markWaitlistConverted(sb, email, insertedBookings ?? []);

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "camp_order.create",
    entity_type: "camp_order",
    entity_id: order.id,
    after: { camp_order_id: order.id, session_count: items.length, total_cents: total, jersey_size: jerseySize },
  });

  // Server-side Purchase to Meta (deduped with the success-page Pixel via session id).
  await sendMetaPurchase({
    eventId: session.id,
    value: total / 100,
    currency: (session.currency ?? "aud").toUpperCase(),
    email,
    phone: session.customer_details?.phone ?? null,
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com"}/booking/camps/success`,
    contentName: "camp_booking",
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";

  await sendEmail({
    to: email,
    subject: `Booking confirmed: ${programTitle}`,
    template: "camp_booking_confirmation",
    relatedCampOrderId: order.id,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7E57C2; margin-bottom: 8px;">You're booked in.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for booking ${programTitle}. Here are your days:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${dayList}</p>
        <p><strong>Venue:</strong> ${venueHtml(venueName)}<br>
           <strong>Time:</strong> 9:00 AM – 1:00 PM<br>
           ${jerseySize ? `<strong>Jersey:</strong> Obsidian training jersey (choose your size on collection)<br>` : ""}
           <strong>Total paid:</strong> ${formatCents(total)}</p>
        <p>Wear suitable indoor court shoes. We provide all volleyball gear.</p>
        ${whatsappHtml(WHATSAPP_PARENTS_URL, "parents")}
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
          Need to change a day? Reschedules with 7+ days notice, subject to availability — just reply to this email. Our camps sell out, so no change-of-mind refunds, but if we can fill your spot from the waitlist we'll refund you. See our <a href="${appUrl}/faq" style="color:#7E57C2;">refund and reschedule policy</a>.
        </p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking ${programTitle}.\n\nDays: ${(sessionRows ?? [])
      .map((s) => new Date(s.starts_at).toLocaleDateString("en-AU", { dateStyle: "full", timeZone: "Australia/Sydney" }))
      .join(", ")}\n\nVenue: ${venueName}\nTime: 9:00 AM – 1:00 PM${jerseySize ? `\nJersey: Obsidian training jersey (choose your size on collection)` : ""}\nTotal paid: ${formatCents(total)}\n\nNeed to change a day? Reschedules with 7+ days notice, subject to availability — just reply to this email. No change-of-mind refunds, but if we can fill your spot from the waitlist we'll refund you. Full policy: ${appUrl}/faq\n\nObsidian Volleyball Academy`,
  });
}

async function handleDropinCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const customerId = session.metadata?.customer_id;
  const participantId = session.metadata?.participant_id;
  const sessionIdsRaw = readChunked(session.metadata, "session_ids");
  const perSessionCents = parseInt(session.metadata?.per_session_cents ?? "0", 10);
  const level = session.metadata?.level ?? null;
  const email = session.customer_details?.email ?? session.customer_email;

  if (!customerId || !participantId || !sessionIdsRaw || !email) {
    throw new Error("Drop-in checkout missing required metadata");
  }
  // Sessions are comma-joined (may span multiple adult programs).
  const sessionIds: string[] = sessionIdsRaw.split(",").filter(Boolean);
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Idempotency: if bookings already exist for this payment, just make sure
  // the authorized payment was captured, then stop.
  if (paymentIntentId) {
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .is("deleted_at", null);
    if (count && count > 0) {
      await ensureCaptured(paymentIntentId);
      return;
    }
  }
  if (await paymentAlreadyReleased(paymentIntentId)) return; // re-delivered after a lost race

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
  const { data: insertedBookings, error: bErr } = await sb
    .from("bookings")
    .insert(bookingsToInsert)
    .select("id, session_id");
  if (bErr) {
    if (isCapacityError(bErr)) {
      // Lost the last-spot race: release the (uncaptured) payment, apologise,
      // keep them on the waitlist. No money moved.
      await handleCapacityRaceLoss(sb, {
        paymentIntentId,
        email,
        name: session.customer_details?.name ?? "",
        phone: session.customer_details?.phone ?? null,
        kidName: null, // adults play themselves
        sessionIds,
        bookingType: "dropin",
        errMessage: bErr.message,
      });
      return;
    }
    // Any other failed insert means the payment is authorized but the customer
    // is enrolled nowhere. Record it loudly (audit_log + Sentry via
    // console.error) so it's caught immediately, then rethrow so the webhook
    // 500s and Stripe retries.
    console.error("dropin booking insert failed — payment may be stranded", {
      paymentIntentId,
      sessionIds,
      customerId,
      message: bErr.message,
    });
    await sb.from("audit_log").insert({
      actor_role: "system",
      action: "dropin.booking_failed",
      entity_type: "customer",
      entity_id: customerId,
      after: { paymentIntentId, sessionIds, error: bErr.message },
    });
    throw bErr;
  }

  // Bookings are in — NOW take the money.
  await ensureCaptured(paymentIntentId);
  if (email) await markWaitlistConverted(sb, email, insertedBookings ?? []);

  const total = session.amount_total ?? perSessionCents * sessionIds.length;
  // Level taxonomy (beginner / social_player / svl_player) has no structured column
  // yet — captured here (and in Stripe metadata) until a participants column exists.
  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "dropin.create",
    entity_type: "customer",
    entity_id: customerId,
    after: { nights: sessionIds.length, total_cents: total, level },
  });

  // Record the optional jersey add-on. Adults buy for themselves, so there's no
  // junior participant context — tracked as 'standalone'.
  await recordJerseyOrder(sb, session, {
    customerId,
    participantId,
    context: "standalone",
    paymentIntentId,
  });

  await sendMetaPurchase({
    eventId: session.id,
    value: total / 100,
    currency: (session.currency ?? "aud").toUpperCase(),
    email,
    phone: session.customer_details?.phone ?? null,
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com"}/booking/adult/success`,
    contentName: "adult_scrim",
  });

  // Session dates + venue for the email (sessions may span programs; use the first).
  const { data: sessionRows } = await sb
    .from("sessions")
    .select("starts_at, ends_at, program_id")
    .in("id", sessionIds)
    .order("starts_at");
  let venueName = "Obsidian Volleyball Academy West Ryde";
  const firstProgramId = sessionRows?.[0]?.program_id;
  if (firstProgramId) {
    const { data: program } = await sb.from("programs").select("venue_id").eq("id", firstProgramId).maybeSingle();
    if (program?.venue_id) {
      const { data: venue } = await sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle();
      if (venue) venueName = venue.address ? `${venue.name}, ${venue.address}` : venue.name;
    }
  }
  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney" });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
  const nightList = (sessionRows ?? [])
    .map((s) => `${fmtDay(s.starts_at)} · ${fmtTime(s.starts_at)} – ${fmtTime(s.ends_at)}`)
    .join("<br>");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";
  const name = session.customer_details?.name ?? "";

  await sendEmail({
    to: email,
    subject: `Booking confirmed: Adult Social Scrim`,
    template: "dropin_booking_confirmation",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7E57C2; margin-bottom: 8px;">You're booked in.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for booking the Adult Social Scrim. Here ${sessionIds.length === 1 ? "is your night" : "are your nights"}:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${nightList}</p>
        <p><strong>Venue:</strong> ${venueHtml(venueName)}<br>
           <strong>Total paid:</strong> ${formatCents(total)} (${sessionIds.length} night${sessionIds.length === 1 ? "" : "s"})</p>
        <p>Wear suitable indoor court shoes. See you on court.</p>
        ${whatsappHtml(WHATSAPP_ADULTS_URL, "adults")}
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
          Adult social nights are non-refundable and non-reschedulable. Questions? Just reply to this email. See our <a href="${appUrl}/faq" style="color:#7E57C2;">refund and reschedule policy</a>.
        </p>
        <p>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking the Adult Social Scrim.\n\nNights:\n${(sessionRows ?? [])
      .map((s) => `${fmtDay(s.starts_at)} ${fmtTime(s.starts_at)} - ${fmtTime(s.ends_at)}`)
      .join("\n")}\n\nVenue: ${venueName}\nTotal paid: ${formatCents(total)}\n\nAdult social nights are non-refundable and non-reschedulable. Questions? Reply to this email. Refund and reschedule policy: ${appUrl}/faq\n\nObsidian Volleyball Academy`,
  });
}

async function handleTrialCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const customerId = session.metadata?.customer_id;
  const participantId = session.metadata?.participant_id;
  const programId = session.metadata?.program_id;
  const sessionId = session.metadata?.session_id;
  const email = session.customer_details?.email ?? session.customer_email;
  if (!customerId || !participantId || !programId || !sessionId || !email) {
    throw new Error("Trial checkout missing required metadata");
  }
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Idempotency: booking already exists → just make sure payment is captured.
  if (paymentIntentId) {
    const { count } = await sb
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .is("deleted_at", null);
    if (count && count > 0) {
      await ensureCaptured(paymentIntentId);
      return;
    }
  }
  if (await paymentAlreadyReleased(paymentIntentId)) return; // re-delivered after a lost race

  const stripeCustomerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (stripeCustomerId) {
    await sb.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);
  }

  const total = session.amount_total ?? 0;
  const { data: insertedBookings, error: bErr } = await sb
    .from("bookings")
    .insert({
      session_id: sessionId,
      participant_id: participantId,
      customer_id: customerId,
      source: "trial" as const,
      status: "confirmed" as const,
      paid_amount_cents: total,
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
    })
    .select("id, session_id");
  if (bErr) {
    if (isCapacityError(bErr)) {
      await handleCapacityRaceLoss(sb, {
        paymentIntentId,
        email,
        name: session.customer_details?.name ?? "",
        phone: session.customer_details?.phone ?? null,
        kidName: await participantName(sb, participantId),
        sessionIds: [sessionId],
        bookingType: "trial",
        errMessage: bErr.message,
      });
      return;
    }
    throw bErr;
  }

  // Booking is in — NOW take the money.
  await ensureCaptured(paymentIntentId);
  await markWaitlistConverted(sb, email, insertedBookings ?? []);

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "trial.create",
    entity_type: "program",
    entity_id: programId,
    after: { program_id: programId, session_id: sessionId, total_cents: total },
  });

  // Program + venue + session date for the email
  const { data: program } = await sb.from("programs").select("title, venue_id").eq("id", programId).maybeSingle();
  let venueName = "Obsidian Volleyball Academy West Ryde";
  if (program?.venue_id) {
    const { data: venue } = await sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle();
    if (venue) venueName = venue.address ? `${venue.name}, ${venue.address}` : venue.name;
  }
  const { data: sessionRow } = await sb.from("sessions").select("starts_at, ends_at").eq("id", sessionId).maybeSingle();
  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney" });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
  const when = sessionRow ? `${fmtDay(sessionRow.starts_at)} · ${fmtTime(sessionRow.starts_at)} – ${fmtTime(sessionRow.ends_at)}` : "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";
  const name = session.customer_details?.name ?? "";

  await sendEmail({
    to: email,
    subject: `Trial booked: ${program?.title ?? "Junior class"}`,
    template: "trial_booking_confirmation",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7E57C2; margin-bottom: 8px;">Trial booked.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for booking a trial class.</p>
        <p>Here's your trial class:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${when}</p>
        <p><strong>Venue:</strong> ${venueHtml(venueName)}</p>
        <p>Wear suitable indoor court shoes. We provide all volleyball gear.</p>
        ${whatsappHtml(WHATSAPP_PARENTS_URL, "parents")}
        <p style="font-size: 13px; color: #666;">Limit one trial per player. Want to join for the term afterwards? Just reply to this email or book from our website. See our <a href="${appUrl}/faq" style="color:#7E57C2;">refund and reschedule policy</a>.</p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `Trial booked.\n\nThanks for booking a trial class.\n\nSession: ${when}\nVenue: ${venueName}\n\nWear suitable indoor court shoes.\n\nLimit one trial per player. Want to join for the term afterwards? Reply to this email or book on our website.\n\nObsidian Volleyball Academy`,
  });
}

async function handleCasualCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const customerId = session.metadata?.customer_id;
  const participantId = session.metadata?.participant_id;
  const programId = session.metadata?.program_id;
  const sessionIdsRaw = readChunked(session.metadata, "session_ids");
  const perCents = parseInt(session.metadata?.per_session_cents ?? "0", 10);
  const email = session.customer_details?.email ?? session.customer_email;
  if (!customerId || !participantId || !sessionIdsRaw || !email) throw new Error("Casual checkout missing metadata");
  const sessionIds = sessionIdsRaw.split(",").filter(Boolean);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  if (paymentIntentId) {
    const { count } = await sb.from("bookings").select("id", { count: "exact", head: true }).eq("stripe_payment_intent_id", paymentIntentId).is("deleted_at", null);
    if (count && count > 0) {
      await ensureCaptured(paymentIntentId);
      return;
    }
  }
  if (await paymentAlreadyReleased(paymentIntentId)) return; // re-delivered after a lost race
  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (stripeCustomerId) await sb.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);

  const paidAt = new Date().toISOString();
  // One confirmed booking per casual class. source='term' (single, no enrolment);
  // the $40 paid_amount_cents distinguishes casual from $36 term-enrolled bookings.
  const rows = sessionIds.map((session_id) => ({
    session_id, participant_id: participantId, customer_id: customerId,
    source: "term" as const, status: "confirmed" as const,
    paid_amount_cents: perCents, stripe_payment_intent_id: paymentIntentId, paid_at: paidAt,
  }));
  const { data: insertedBookings, error: bErr } = await sb.from("bookings").insert(rows).select("id, session_id");
  if (bErr) {
    if (isCapacityError(bErr)) {
      await handleCapacityRaceLoss(sb, {
        paymentIntentId,
        email,
        name: session.customer_details?.name ?? "",
        phone: session.customer_details?.phone ?? null,
        kidName: await participantName(sb, participantId),
        sessionIds,
        bookingType: "casual",
        errMessage: bErr.message,
      });
      return;
    }
    throw bErr;
  }

  // Bookings are in — NOW take the money.
  await ensureCaptured(paymentIntentId);
  await markWaitlistConverted(sb, email, insertedBookings ?? []);

  const total = session.amount_total ?? perCents * sessionIds.length;
  await sb.from("audit_log").insert({ actor_role: "system", action: "casual.create", entity_type: "program", entity_id: programId, after: { classes: sessionIds.length, total_cents: total } });

  const { data: program } = await sb.from("programs").select("title, venue_id").eq("id", programId ?? "").maybeSingle();
  let venueName = "Obsidian Volleyball Academy West Ryde";
  if (program?.venue_id) {
    const { data: v } = await sb.from("venues").select("name, address").eq("id", program.venue_id).maybeSingle();
    if (v) venueName = v.address ? `${v.name}, ${v.address}` : v.name;
  }
  const { data: srows } = await sb.from("sessions").select("starts_at, ends_at").in("id", sessionIds).order("starts_at");
  const fDay = (iso: string) => new Date(iso).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney" });
  const fTime = (iso: string) => new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
  const list = (srows ?? []).map((s) => `${fDay(s.starts_at)} · ${fTime(s.starts_at)} – ${fTime(s.ends_at)}`).join("<br>");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";
  const name = session.customer_details?.name ?? "";

  await sendEmail({
    to: email,
    subject: `Booking confirmed: ${program?.title ?? "Junior class"}`,
    template: "casual_booking_confirmation",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7E57C2; margin-bottom: 8px;">You're booked in.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for booking ${program?.title ?? "a casual class"}. Here ${sessionIds.length === 1 ? "is your class" : "are your classes"}:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${list}</p>
        <p><strong>Venue:</strong> ${venueHtml(venueName)}<br>
           <strong>Total paid:</strong> ${formatCents(total)} (${sessionIds.length} class${sessionIds.length === 1 ? "" : "es"} · casual)</p>
        <p>Wear suitable indoor court shoes. We provide all volleyball gear.</p>
        ${whatsappHtml(WHATSAPP_PARENTS_URL, "parents")}
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
          Coming regularly? Enrol for the term and pay $36/class instead of $40. Questions? Just reply to this email. See our <a href="${appUrl}/faq" style="color:#7E57C2;">refund and reschedule policy</a>.
        </p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking ${program?.title ?? "a casual class"}.\n\n${(srows ?? []).map((s) => `${fDay(s.starts_at)} ${fTime(s.starts_at)} - ${fTime(s.ends_at)}`).join("\n")}\n\nVenue: ${venueName}\nTotal paid: ${formatCents(total)} (casual)\n\nComing regularly? Enrol for the term and pay $36/class instead of $40.\nRefund and reschedule policy: ${appUrl}/faq\n\nObsidian Volleyball Academy`,
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

  // A FULL refund frees the seats: the capacity trigger only counts
  // confirmed/pending bookings, so setting status='cancelled' is what actually
  // reopens the spot on the booking pages. Partial refunds keep bookings
  // intact — cancelling all rows on the payment would give away seats that are
  // still paid for (e.g. one day of a multi-day camp refunded ad-hoc); handle
  // those per-booking in the dashboard.
  let freedSessionIds: string[] = [];
  if (charge.refunded) {
    const { data: cancellable } = await sb
      .from("bookings")
      .select("id, session_id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .in("status", ["confirmed", "pending"])
      .is("deleted_at", null);
    if (cancellable?.length) {
      await sb
        .from("bookings")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: "system",
          cancellation_reason: "Payment refunded in full (Stripe charge.refunded)",
        })
        .in(
          "id",
          cancellable.map((b) => b.id)
        );
      freedSessionIds = Array.from(new Set(cancellable.map((b) => b.session_id)));
    }
    // A fully-refunded term enrolment is over too.
    await sb
      .from("enrolments")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("stripe_payment_intent_id", paymentIntentId)
      .neq("status", "cancelled");
  }

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "refund.processed",
    entity_type: "payment_intent",
    entity_id: null,
    after: {
      payment_intent_id: paymentIntentId,
      refunded_cents: charge.amount_refunded,
      fully_refunded: charge.refunded,
      bookings_cancelled: freedSessionIds.length > 0,
      freed_session_ids: freedSessionIds,
    },
  });

  // Waitlist notification is deliberately NOT automatic here. Cancelling from
  // the dashboard (with or without a refund) is where the admin is prompted
  // "email the waitlist?"; the dashboard then calls POST /api/waitlist/notify.
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
  // session_ids may be chunked across numbered keys (long terms exceed Stripe's
  // 500-char metadata limit). Legacy sessions stored a JSON array; new ones store
  // a comma-joined list — handle both.
  const sessionIdsRaw = readChunked(session.metadata, "session_ids");
  const sessionIds: string[] = sessionIdsRaw.startsWith("[")
    ? JSON.parse(sessionIdsRaw)
    : sessionIdsRaw.split(",").filter(Boolean);
  const total = session.amount_total ?? perWeekCents * weeks;
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  // Idempotency: if we've already processed this Stripe session, just make
  // sure the authorized payment was captured, then stop.
  const { data: existingEnrolment } = await sb
    .from("enrolments")
    .select("id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existingEnrolment) {
    if (existingEnrolment.status === "active") await ensureCaptured(paymentIntentId);
    // Cancelled = a lost capacity race; re-run the idempotent release so a
    // throw between void-enrolment and release can't strand the auth.
    else if (existingEnrolment.status === "cancelled" && paymentIntentId) await releasePayment(paymentIntentId);
    return;
  }

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
  const { data: insertedBookings, error: bErr } = await sb
    .from("bookings")
    .insert(bookingsToInsert)
    .select("id, session_id");
  if (bErr) {
    if (isCapacityError(bErr)) {
      // Lost the last-spot race: void the enrolment, release the (uncaptured)
      // payment, apologise, keep them on the waitlist. One waitlist row per
      // remaining class, so they stay notifiable for the whole term (rows on
      // passed sessions are ignored by the notify query).
      await sb
        .from("enrolments")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", enrolment.id);
      await handleCapacityRaceLoss(sb, {
        paymentIntentId,
        email,
        name: session.customer_details?.name ?? "",
        phone: session.customer_details?.phone ?? null,
        kidName: await participantName(sb, participantId),
        sessionIds,
        bookingType: "term",
        errMessage: bErr.message,
      });
      return;
    }
    throw bErr;
  }

  // Bookings are in — NOW take the money.
  await ensureCaptured(paymentIntentId);
  await markWaitlistConverted(sb, email, insertedBookings ?? []);

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "enrolment.create",
    entity_type: "enrolment",
    entity_id: enrolment.id,
    after: { enrolment_id: enrolment.id, weeks, total_cents: total },
  });

  // Record the optional jersey add-on (term context).
  await recordJerseyOrder(sb, session, {
    customerId,
    participantId,
    context: "term",
    enrolmentId: enrolment.id,
    paymentIntentId,
  });

  await sendMetaPurchase({
    eventId: session.id,
    value: total / 100,
    currency: (session.currency ?? "aud").toUpperCase(),
    email,
    phone: session.customer_details?.phone ?? null,
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com"}/booking/term/success`,
    contentName: "term_enrolment",
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
    .select("starts_at, ends_at")
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
  const fmtT = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
  // All term sessions share the same weekly time, so show it once.
  const classTime = sessionRows?.[0] ? `${fmtT(sessionRows[0].starts_at)} – ${fmtT(sessionRows[0].ends_at)}` : "";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com";

  const name = session.customer_details?.name ?? "";
  await sendEmail({
    to: email,
    subject: `Enrolment confirmed: ${program?.title ?? "Term program"}`,
    template: "term_enrolment_confirmation",
    relatedEnrolmentId: enrolment.id,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7E57C2;">You're enrolled.</h2>
        <p>Hi${name ? " " + name.split(" ")[0] : ""},</p>
        <p>Thanks for enrolling in ${program?.title ?? "the term program"}. Here are your classes this term:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${dayList}</p>
        <p><strong>Venue:</strong> ${venueHtml(venueName)}<br>
           ${classTime ? `<strong>Time:</strong> ${classTime}<br>` : ""}
           <strong>Total paid:</strong> $${(total / 100).toFixed(2)} (${weeks} week${weeks === 1 ? "" : "s"} × $${(perWeekCents / 100).toFixed(2)})</p>
        <p>Wear suitable indoor court shoes and your Obsidian Volleyball training jersey. We provide all volleyball gear.</p>
        ${whatsappHtml(WHATSAPP_PARENTS_URL, "parents")}
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
          Questions or need to change something? Just reply to this email and we'll help. See our <a href="${appUrl}/faq" style="color:#7E57C2;">refund and reschedule policy</a>.
        </p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're enrolled in ${program?.title ?? "the term program"}.\n\nClasses this term: ${(sessionRows ?? []).length}${classTime ? `\nTime: ${classTime}` : ""}\nVenue: ${venueName}\nTotal paid: $${(total / 100).toFixed(2)}\n\nQuestions or changes? Just reply to this email. Refund and reschedule policy: ${appUrl}/faq\n\nObsidian Volleyball Academy`,
  });
}

// Standalone jersey purchase (no camp/term booking). Records a jersey_orders row
// with context 'standalone' and sends an order confirmation.
async function handleJerseyCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const email = session.customer_details?.email ?? session.customer_email;
  let customerId = session.metadata?.customer_id ?? null;
  let participantId = session.metadata?.participant_id ?? null;
  const size = session.metadata?.jersey_size && session.metadata.jersey_size !== "none" ? session.metadata.jersey_size : null;
  const qty = parseInt(session.metadata?.jersey_qty ?? "1", 10) || 1;
  if (!size) throw new Error("Jersey checkout missing size");

  // Idempotency: one jersey_orders row per checkout session.
  const { data: existing } = await sb
    .from("jersey_orders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existing) return;

  // The minimal shop form collects only a child name + mobile; Stripe collects
  // the email at payment, so the customer is created here from session details
  // + metadata.
  const phone = session.metadata?.jersey_phone || null;
  if (!customerId && email) {
    const { data: c } = await sb.from("customers").select("id").eq("email", email.toLowerCase()).is("deleted_at", null).maybeSingle();
    customerId = c?.id ?? null;
    if (!customerId) {
      const name = session.customer_details?.name ?? "";
      const [first, ...rest] = name.split(" ");
      const { data: created, error } = await sb
        .from("customers")
        .insert({ email: email.toLowerCase(), first_name: first || null, last_name: rest.join(" ") || null, phone })
        .select("id")
        .single();
      if (error) throw error;
      customerId = created.id;
    }
  }
  if (!customerId) throw new Error("Jersey checkout missing customer");

  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const customerUpdates: Record<string, string> = {};
  if (stripeCustomerId) customerUpdates.stripe_customer_id = stripeCustomerId;
  if (phone) customerUpdates.phone = phone;
  if (Object.keys(customerUpdates).length) await sb.from("customers").update(customerUpdates).eq("id", customerId);

  // Link the jersey to the child it's for. The shop form sends the child's
  // name; reuse the customer's existing participant if the name matches (same
  // family buying after a camp booking), otherwise create one. Best-effort: a
  // failure here must not lose the order itself.
  const childName = session.metadata?.jersey_child_name?.trim();
  if (!participantId && childName) {
    try {
      const [childFirst, ...childRest] = childName.split(/\s+/);
      const childLast = childRest.join(" ");
      const { data: kids } = await sb
        .from("participants")
        .select("id, first_name, last_name")
        .eq("customer_id", customerId)
        .is("deleted_at", null);
      const match = (kids ?? []).find(
        (k) =>
          `${k.first_name} ${k.last_name}`.trim().toLowerCase() === childName.toLowerCase() ||
          (!childLast && k.first_name.trim().toLowerCase() === childFirst.toLowerCase())
      );
      if (match) {
        participantId = match.id;
      } else {
        const { data: created, error } = await sb
          .from("participants")
          .insert({ customer_id: customerId, first_name: childFirst, last_name: childLast })
          .select("id")
          .single();
        if (error) throw error;
        participantId = created.id;
      }
    } catch (err) {
      console.warn("jersey participant link skipped:", err instanceof Error ? err.message : err);
    }
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  await recordJerseyOrder(sb, session, { customerId, participantId, context: "standalone", paymentIntentId, quantity: qty });

  const total = session.amount_total ?? 0;
  const firstName = (session.customer_details?.name ?? "").split(" ")[0];
  if (email) {
    await sendEmail({
      to: email,
      subject: "Your Obsidian jersey order",
      template: "jersey_order_confirmation",
      html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7E57C2; margin-bottom: 8px;">Order confirmed.</h2>
        <p>Hi${firstName ? " " + firstName : ""},</p>
        <p>Thanks for your order. Here are the details:</p>
        <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">
          <strong>Obsidian training jersey</strong>${qty > 1 ? `<br>Quantity: ${qty}` : ""}<br>Choose your size when you collect it.<br>Total paid: ${formatCents(total)}
        </p>
        <p>We'll be in touch about getting your jersey to you. Just reply to this email with any questions.</p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
      text: `Order confirmed.\n\nObsidian training jersey${qty > 1 ? `\nQuantity: ${qty}` : ""}\nChoose your size when you collect it.\nTotal paid: ${formatCents(total)}\n\nWe'll be in touch about getting your jersey to you. Questions? Reply to this email.\n\nObsidian Volleyball Academy`,
    });
  }

  await sb.from("audit_log").insert({
    actor_role: "system",
    action: "jersey_order.create",
    entity_type: "customer",
    entity_id: customerId,
    after: { size, quantity: qty, total_cents: total, context: "standalone" },
  });

  await sendMetaPurchase({
    eventId: session.id,
    value: total / 100,
    currency: (session.currency ?? "aud").toUpperCase(),
    email,
    phone: session.customer_details?.phone ?? null,
    sourceUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidianvolleyball.com"}/shop/jersey/success`,
    contentName: "jersey_purchase",
  });
}
