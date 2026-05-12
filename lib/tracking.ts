// Client-side tracking helpers.
// We push everything into both:
//   1. window.dataLayer  (consumed by Google Tag Manager / GA4)
//   2. window.fbq        (consumed by the Meta Pixel)
//
// Standard event mapping:
//   trackBookingClick       -> Pixel "InitiateCheckout"
//                              (user clicked an Acuity booking link, leaving our site)
//   trackContactClick       -> Pixel "Lead"
//                              (user reached out via email / IG / phone)
//   trackConversionComplete -> not forwarded to Pixel.
//                              Acuity itself fires Pixel "Purchase" on its
//                              confirmation page (that's where the existing
//                              28-day event volume comes from). Firing a
//                              second Purchase event from /thank-you would
//                              double-count without proper deduplication.
//
// All Pixel calls are no-ops when fbq is unavailable (Pixel not loaded, env
// var missing, or ad blocker active), so dropping these helpers anywhere is
// safe.

type FbqFn = ((command: "track" | "trackCustom" | "init", ...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    fbq?: FbqFn;
  }
}

export type BookingTier = "single_day" | "5_day_pack" | "half_day" | "general";
export type BookingLocation =
  | "hero"
  | "nav"
  | "nav_mobile"
  | "floating_cta"
  | "footer"
  | "pricing_single"
  | "pricing_package"
  | "pricing_half"
  | "camp_hero"
  | "camp_cta"
  | "coaches_cta"
  | "about_cta"
  | "term_programs_hero"
  | "adult_sessions_cta"
  | "book_page"
  | "areas_index_cta"
  | "promo_banner";

// Subset of Meta's standard events. Extend as needed.
export type PixelStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Search"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Contact"
  | "Subscribe"
  | "Schedule";

export interface PixelEventData {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

export function trackPixelEvent(event: PixelStandardEvent, data?: PixelEventData) {
  if (typeof window === "undefined" || !window.fbq) return;
  if (data) {
    window.fbq("track", event, data);
  } else {
    window.fbq("track", event);
  }
}

export function trackBookingClick(tier: BookingTier, location: BookingLocation) {
  pushDataLayer({
    event: "booking_click",
    booking_tier: tier,
    booking_location: location,
  });
  trackPixelEvent("InitiateCheckout", {
    content_name: location,
    content_category: tier,
  });
}

export function trackContactClick(method: "email" | "instagram" | "phone") {
  pushDataLayer({ event: "contact_click", contact_method: method });
  trackPixelEvent("Lead", { content_name: `contact_${method}` });
}

export function trackConversionComplete() {
  pushDataLayer({ event: "conversion_complete" });
  // No Pixel call here on purpose: Acuity already fires Purchase from its
  // own confirmation page. Re-firing here would double-count attribution.
}
