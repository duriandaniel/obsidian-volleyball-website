declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
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
  | "book_page";

export function trackBookingClick(tier: BookingTier, location: BookingLocation) {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "booking_click",
      booking_tier: tier,
      booking_location: location,
    });
  }
}

export function trackContactClick(method: "email" | "instagram" | "phone") {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "contact_click",
      contact_method: method,
    });
  }
}

export function trackConversionComplete() {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push({
      event: "conversion_complete",
    });
  }
}
