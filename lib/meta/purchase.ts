import { stripe } from "@/lib/stripe/server";

export type PurchaseInfo = { value: number; currency: string; eventId: string };

// Look up the paid amount for a Stripe Checkout Session so the success page can
// fire a Meta "Purchase" with the real value. eventId = the session id, shared
// with the server-side Conversions API event for de-duplication.
export async function getPurchaseForSession(sessionId: string | null): Promise<PurchaseInfo | null> {
  if (!sessionId) return null;
  try {
    const s = await stripe().checkout.sessions.retrieve(sessionId);
    if (!s || s.payment_status !== "paid") return null;
    return {
      value: (s.amount_total ?? 0) / 100,
      currency: (s.currency ?? "aud").toUpperCase(),
      eventId: s.id,
    };
  } catch {
    return null;
  }
}
