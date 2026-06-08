import crypto from "node:crypto";

// Meta Conversions API: server-side Purchase events. Resilient to ad blockers
// and iOS tracking limits, and de-duplicated with the browser Pixel event via a
// shared event_id (the Stripe Checkout Session id).
//
// No-op unless both NEXT_PUBLIC_META_PIXEL_ID and META_CAPI_TOKEN are set, so it
// is safe to deploy before the token exists. Set META_TEST_EVENT_CODE to route
// events to the Events Manager "Test Events" tab while verifying.
const GRAPH_VERSION = "v21.0";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Meta expects email lowercased+trimmed, phone digits-only (with country code).
function hashEmail(email: string): string {
  return sha256(email.trim().toLowerCase());
}
function hashPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits ? sha256(digits) : "";
}

export type MetaPurchaseInput = {
  eventId: string; // Stripe Checkout Session id (matches the browser event)
  value: number; // dollars
  currency: string;
  email?: string | null;
  phone?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  sourceUrl?: string | null;
  contentName?: string;
  contentCategory?: string;
  eventTime?: number; // unix seconds
};

export async function sendMetaPurchase(input: MetaPurchaseInput): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token) return; // not configured yet — no-op

  const user_data: Record<string, unknown> = {};
  if (input.email) user_data.em = [hashEmail(input.email)];
  if (input.phone) {
    const ph = hashPhone(input.phone);
    if (ph) user_data.ph = [ph];
  }
  if (input.fbp) user_data.fbp = input.fbp;
  if (input.fbc) user_data.fbc = input.fbc;
  if (input.clientIp) user_data.client_ip_address = input.clientIp;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;

  const event: Record<string, unknown> = {
    event_name: "Purchase",
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    user_data,
    custom_data: {
      value: input.value,
      currency: input.currency,
      ...(input.contentName ? { content_name: input.contentName } : {}),
      ...(input.contentCategory ? { content_category: input.contentCategory } : {}),
    },
  };
  if (input.sourceUrl) event.event_source_url = input.sourceUrl;

  const body: Record<string, unknown> = { data: [event] };
  const testCode = process.env.META_TEST_EVENT_CODE?.trim();
  if (testCode) body.test_event_code = testCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    if (!res.ok) {
      console.warn("Meta CAPI Purchase failed:", res.status, await res.text());
    }
  } catch (err) {
    console.warn("Meta CAPI Purchase error:", err instanceof Error ? err.message : err);
  }
}
