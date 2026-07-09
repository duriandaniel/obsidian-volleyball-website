// One-off: resend a camp/class booking confirmation email for a camp_order.
// Mirrors the webhook's camp_booking_confirmation template (per-day times).
// Usage: npx tsx --env-file=.env.local scripts/resend-camp-confirmation.mts <camp_order_id> [override_email]
// Sends via lib/email/send (SMTP) and logs to email_log like any other send.
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "../lib/email/send";

const [orderId, overrideEmail] = process.argv.slice(2);
if (!orderId) {
  console.error("Usage: resend-camp-confirmation.mts <camp_order_id> [override_email]");
  process.exit(1);
}

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

const { data: order, error: oErr } = await sb
  .from("camp_orders")
  .select("id, customer_id, total_cents, status")
  .eq("id", orderId)
  .single();
if (oErr || !order) throw new Error(`order not found: ${oErr?.message}`);
if (order.status !== "paid") throw new Error(`order status is ${order.status}, not paid — refusing to send`);

const { data: customer } = await sb
  .from("customers")
  .select("email, first_name")
  .eq("id", order.customer_id)
  .single();
const to = overrideEmail ?? customer?.email;
if (!to) throw new Error("no recipient email");

const { data: bookings } = await sb
  .from("bookings")
  .select("session_id, status, sessions(starts_at, ends_at, program_id)")
  .eq("camp_order_id", orderId)
  .is("deleted_at", null)
  .in("status", ["confirmed", "pending"]);
if (!bookings?.length) throw new Error("no bookings on this order");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sessions = bookings.map((b) => b.sessions as any).sort((a, b) => a.starts_at.localeCompare(b.starts_at));

const { data: prog } = await sb.from("programs").select("title, venue_id").eq("id", sessions[0].program_id).maybeSingle();
let venueName = "Baulkham Hills High School";
if (prog?.venue_id) {
  const { data: ven } = await sb.from("venues").select("name, address").eq("id", prog.venue_id).maybeSingle();
  if (ven) venueName = ven.address ? `${ven.name}, ${ven.address}` : ven.name;
}
const programTitle = prog?.title ?? "Obsidian Holiday Camp";

const fmtDay = (s: { starts_at: string; ends_at: string }) => {
  const date = new Date(s.starts_at).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", timeZone: "Australia/Sydney",
  });
  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" });
  return `${date} · ${time(s.starts_at)} – ${time(s.ends_at)}`;
};
const dayList = sessions.map(fmtDay).join("<br>");
const total = `$${(order.total_cents / 100).toFixed(2)}`;
const firstName = customer?.first_name ? ` ${customer.first_name}` : "";
const appUrl = "https://obsidianvolleyball.com";
const WHATSAPP_PARENTS_URL = "https://chat.whatsapp.com/HYlStwL25fMJaXpl7hWkbU";

const result = await sendEmail({
  to,
  subject: `Booking confirmed: ${programTitle}`,
  template: "camp_booking_confirmation",
  relatedCampOrderId: order.id,
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #7E57C2; margin-bottom: 8px;">You're booked in.</h2>
      <p>Hi${firstName},</p>
      <p>Thanks for booking ${programTitle}. Here are your days:</p>
      <p style="background: #f6f3ff; padding: 12px 16px; border-radius: 6px;">${dayList}</p>
      <p><strong>Venue:</strong> ${venueName}<br>
         <strong>Total paid:</strong> ${total}</p>
      <p>Wear suitable indoor court shoes. We provide all volleyball gear.</p>
      <p style="font-size: 13px; color: #666;">Join the parents WhatsApp group for updates and reminders: <a href="${WHATSAPP_PARENTS_URL}" style="color:#7E57C2;">tap to join</a>.</p>
      <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 13px; color: #666;">
        Plans change? Just reply to this email. See our <a href="${appUrl}/refund-policy" style="color:#7E57C2;">cancellation and refund policy</a>.
      </p>
      <p>See you on court!<br>Obsidian Volleyball Academy</p>
    </div>
  `,
  text: `You're booked in.\n\nThanks for booking ${programTitle}.\n\nDays:\n${sessions
    .map(fmtDay)
    .join("\n")}\n\nVenue: ${venueName}\nTotal paid: ${total}\n\nPlans change? Just reply to this email. Full policy: ${appUrl}/refund-policy\n\nObsidian Volleyball Academy`,
});

console.log(JSON.stringify({ to, orderId, days: sessions.map(fmtDay), total, result }, null, 2));
