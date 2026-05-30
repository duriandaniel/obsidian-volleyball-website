// Pricing engine for camps and term programs.
// Pure functions, no DB. Easy to unit test.

export type CampTier = { full_days: number; price_cents: number };

export type CampCartItem = {
  session_id: string;
  is_half_day: boolean;
};

export type CampPricingResult = {
  full_day_equivalents: number;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  matched_tier: CampTier | null;
};

// Default OVA camp tiers (editable via admin later).
// Half day = 0.5 of a full day for tier matching.
export const DEFAULT_CAMP_TIERS: CampTier[] = [
  { full_days: 0.5, price_cents: 3500 },
  { full_days: 1, price_cents: 5000 },
  { full_days: 2, price_cents: 9800 },
  { full_days: 3, price_cents: 14400 },
  { full_days: 4, price_cents: 18800 },
  { full_days: 5, price_cents: 20000 },
];

export function priceCampCart(cart: CampCartItem[], tiers: CampTier[] = DEFAULT_CAMP_TIERS): CampPricingResult {
  if (cart.length === 0) {
    return { full_day_equivalents: 0, subtotal_cents: 0, discount_cents: 0, total_cents: 0, matched_tier: null };
  }

  const fullDayEquivalents = cart.reduce((sum, item) => sum + (item.is_half_day ? 0.5 : 1), 0);

  // Sum of individual full-day / half-day prices (subtotal without bundle discount)
  const tierFor = (days: number) => tiers.find((t) => t.full_days === days) ?? null;
  const halfDayTier = tierFor(0.5);
  const fullDayTier = tierFor(1);
  const subtotal = cart.reduce((sum, item) => {
    const t = item.is_half_day ? halfDayTier : fullDayTier;
    return sum + (t?.price_cents ?? 0);
  }, 0);

  // Find the best matching bundle tier (largest full_days <= fullDayEquivalents).
  // If exact match, use bundle price; else fall back to subtotal.
  const matched = tiers
    .filter((t) => t.full_days <= fullDayEquivalents && t.full_days >= 1)
    .sort((a, b) => b.full_days - a.full_days)[0] ?? null;

  let total = subtotal;
  if (matched && matched.full_days === fullDayEquivalents) {
    // Exact tier match (e.g. cart = 5 full days, tier = 5)
    total = matched.price_cents;
  } else if (matched) {
    // Partial match: use bundle price for the bundle-qualifying portion, add per-day for the rest
    const remainder = fullDayEquivalents - matched.full_days;
    const remainderPrice =
      Math.floor(remainder) * (fullDayTier?.price_cents ?? 0) +
      (remainder % 1 === 0.5 ? halfDayTier?.price_cents ?? 0 : 0);
    total = matched.price_cents + remainderPrice;
  }

  return {
    full_day_equivalents: fullDayEquivalents,
    subtotal_cents: subtotal,
    discount_cents: Math.max(0, subtotal - total),
    total_cents: total,
    matched_tier: matched,
  };
}

// Paid one-week trial for junior weekly classes. Fully credited toward term
// enrolment if the athlete joins. Adjust here to change the trial price.
export const TRIAL_PRICE_CENTS = 2500;

// Term pricing: per-week × weeks remaining in the term from today.
export function priceTermEnrolment(perWeekCents: number, weeksRemaining: number) {
  if (weeksRemaining <= 0) {
    return { weeks: 0, total_cents: 0 };
  }
  return { weeks: weeksRemaining, total_cents: perWeekCents * weeksRemaining };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Display "spots left" without revealing exact capacity when there's lots of room.
// Shows a precise number once it drops to single digits (≤9), nudging urgency.
export function formatSpotsLeft(remaining: number): string {
  if (remaining <= 0) return "Sold out";
  if (remaining < 10) return `${remaining} spot${remaining === 1 ? "" : "s"} left`;
  return "10+ spots left";
}
