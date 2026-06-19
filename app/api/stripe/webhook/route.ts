import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { sendMetaPurchase } from "@/lib/meta/capi";
import { formatCents } from "@/lib/booking/pricing";
import type Stripe from "stripe";

// Stripe webhook needs the raw body to verify the signature.
export const dynamic = "force-dynamic";

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
  const total = session.amount_total ?? 0; // includes jersey add-on, reflects any promo discount
  const jerseyCents = parseInt(session.metadata?.jersey_cents ?? "0", 10) || 0;
  const jerseySize =
    session.metadata?.jersey_size && session.metadata.jersey_size !== "none"
      ? session.metadata.jersey_size
      : null;
  // Camp-only portion (exclude the jersey) for the per-booking amount.
  const campPortion = Math.max(0, total - jerseyCents);
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

  // Record the optional jersey add-on (camp context).
  await recordJerseyOrder(sb, session, {
    customerId: customerId!,
    participantId: participantId ?? null,
    context: "camp",
    campOrderId: order.id,
    paymentIntentId,
  });

  // Create one booking per session
  const bookingsToInsert = items.map((item) => ({
    session_id: item.session_id,
    participant_id: participantId,
    customer_id: customerId,
    source: "camp" as const,
    camp_order_id: order.id,
    status: "confirmed" as const,
    paid_amount_cents: items.length ? Math.floor(campPortion / items.length) : campPortion,
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
          Questions or need to change your booking? Just reply to this email and we'll sort it out. See our <a href="${appUrl}/faq" style="color:#7E57C2;">refund and reschedule policy</a>.
        </p>
        <p>See you on court!<br>Obsidian Volleyball Academy</p>
      </div>
    `,
    text: `You're booked in.\n\nThanks for booking ${programTitle}.\n\nDays: ${(sessionRows ?? [])
      .map((s) => new Date(s.starts_at).toLocaleDateString("en-AU", { dateStyle: "full", timeZone: "Australia/Sydney" }))
      .join(", ")}\n\nVenue: ${venueName}\nTime: 9:00 AM – 1:00 PM${jerseySize ? `\nJersey: Obsidian training jersey (choose your size on collection)` : ""}\nTotal paid: ${formatCents(total)}\n\nQuestions or changes? Just reply to this email. Refund and reschedule policy: ${appUrl}/faq\n\nObsidian Volleyball Academy`,
  });
}

async function handleDropinCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sb = supabaseAdmin();
  const customerId = session.metadata?.customer_id;
  const participantId = session.metadata?.participant_id;
  const sessionIdsRaw = session.metadata?.session_ids;
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

  // Idempotency
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

  const total = session.amount_total ?? 0;
  const { error: bErr } = await sb.from("bookings").insert({
    session_id: sessionId,
    participant_id: participantId,
    customer_id: customerId,
    source: "trial" as const,
    status: "confirmed" as const,
    paid_amount_cents: total,
    stripe_payment_intent_id: paymentIntentId,
    paid_at: new Date().toISOString(),
  });
  if (bErr) throw bErr;

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
  const sessionIdsRaw = session.metadata?.session_ids;
  const perCents = parseInt(session.metadata?.per_session_cents ?? "0", 10);
  const email = session.customer_details?.email ?? session.customer_email;
  if (!customerId || !participantId || !sessionIdsRaw || !email) throw new Error("Casual checkout missing metadata");
  const sessionIds = sessionIdsRaw.split(",").filter(Boolean);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;

  if (paymentIntentId) {
    const { count } = await sb.from("bookings").select("id", { count: "exact", head: true }).eq("stripe_payment_intent_id", paymentIntentId).is("deleted_at", null);
    if (count && count > 0) return;
  }
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
  const { error: bErr } = await sb.from("bookings").insert(rows);
  if (bErr) throw bErr;

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
  const participantId = session.metadata?.participant_id ?? null;
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

  // Defensive: make sure a customer exists (the checkout route normally sets it).
  if (!customerId && email) {
    const { data: c } = await sb.from("customers").select("id").eq("email", email.toLowerCase()).is("deleted_at", null).maybeSingle();
    customerId = c?.id ?? null;
    if (!customerId) {
      const name = session.customer_details?.name ?? "";
      const [first, ...rest] = name.split(" ");
      const { data: created, error } = await sb
        .from("customers")
        .insert({ email: email.toLowerCase(), first_name: first || null, last_name: rest.join(" ") || null })
        .select("id")
        .single();
      if (error) throw error;
      customerId = created.id;
    }
  }
  if (!customerId) throw new Error("Jersey checkout missing customer");

  const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  if (stripeCustomerId) await sb.from("customers").update({ stripe_customer_id: stripeCustomerId }).eq("id", customerId);

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
