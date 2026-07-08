// Pricing engine for camps and term programs.
// Pure functions, no DB. Easy to unit test.

// ── Holiday camp pricing ──────────────────────────────────────────────
// Full days follow a ladder that gets cheaper at the 5-day week pass.
// Half days are a flat, separate product and do NOT count toward the
// full-day ladder. The jersey is an optional, separate add-on.
export const CAMP_FULL_DAY_CENTS = 7000; // 1–4 days, per day
export const CAMP_FIVE_DAY_PASS_CENTS = 25000; // flat 5-day week pass
export const CAMP_EXTRA_DAY_CENTS = 4000; // each full day beyond 5
export const CAMP_HALF_DAY_CENTS = 4500; // flat, per half day (9–11am)
export const CAMP_JERSEY_CENTS = 3600; // optional jersey add-on

export type CampCartItem = {
  session_id: string;
  is_half_day: boolean;
};

export type CampPricingResult = {
  full_days: number;
  half_days: number;
  full_day_cents: number; // ladder price for the full days
  half_day_cents: number; // flat half-day price total
  subtotal_cents: number; // rack rate (full days at per-day) — used to show the bundle saving
  discount_cents: number; // saving from the 5+ day bundle
  total_cents: number; // full + half, EXCLUDES the optional jersey
  show_five_day_nudge: boolean; // exactly 4 full days: a 5-day pass is cheaper
};

// Ladder price for n full days. 1=70, 2=140, 3=210, 4=280, 5=250,
// 6=290, 7=330, 8=370, 9=410 ... (intentional cliff: 4 days > 5-day pass).
export function priceCampFullDays(n: number): number {
  if (n <= 0) return 0;
  if (n <= 4) return CAMP_FULL_DAY_CENTS * n;
  if (n === 5) return CAMP_FIVE_DAY_PASS_CENTS;
  return CAMP_FIVE_DAY_PASS_CENTS + CAMP_EXTRA_DAY_CENTS * (n - 5);
}

export function priceCampCart(cart: CampCartItem[]): CampPricingResult {
  const fullDays = cart.reduce((n, i) => n + (i.is_half_day ? 0 : 1), 0);
  const halfDays = cart.reduce((n, i) => n + (i.is_half_day ? 1 : 0), 0);

  const fullDayCents = priceCampFullDays(fullDays);
  const halfDayCents = CAMP_HALF_DAY_CENTS * halfDays;

  // Rack rate: every full day at the flat per-day price (no bundle), plus
  // half days. Difference vs the ladder is the bundle saving we surface.
  const subtotal = CAMP_FULL_DAY_CENTS * fullDays + halfDayCents;
  const total = fullDayCents + halfDayCents;

  return {
    full_days: fullDays,
    half_days: halfDays,
    full_day_cents: fullDayCents,
    half_day_cents: halfDayCents,
    subtotal_cents: subtotal,
    discount_cents: Math.max(0, subtotal - total),
    total_cents: total,
    show_five_day_nudge: fullDays === 4,
  };
}

// Paid trial class for junior weekly classes. Fully credited toward term
// enrolment if the athlete joins. Adjust here to change the trial price.
export const TRIAL_PRICE_CENTS = 2500;

// Launch promo: Kellyville trials are FREE while this is true; West Ryde stays
// paid. Set to false to end the promo and charge the standard price everywhere.
// Ended for Term 3 (Jul 2026): trials are $25 at every venue.
export const KELLYVILLE_FREE_TRIAL = false;

// Trial price for a class, by its venue name. Free ($0) for Kellyville during
// the launch promo. Single source of truth for both the trial list and checkout.
export function trialPriceCentsForVenue(venueName: string | null | undefined): number {
  if (KELLYVILLE_FREE_TRIAL && /kellyville/i.test(venueName ?? "")) return 0;
  return TRIAL_PRICE_CENTS;
}

// Kellyville launch promo: the taster sessions before Term 3 were advertised
// as free, so a full-term Kellyville enrolment is billed only for the Term 3
// weeks (10 × $36 = $360), never the bonus June/July weeks — independent of
// the trial-price promo above (ending paid trials must not retroactively
// charge for tasters). Other venues bill every remaining session. After
// 21 Jul 2026 the carve-out is moot (all remaining sessions are billable).
const KELLYVILLE_TERM3_START_MS = Date.parse("2026-07-21T00:00:00+10:00");
export function billableTermWeeks(venueName: string | null | undefined, sessionStartIsos: string[]): number {
  if (/kellyville/i.test(venueName ?? "")) {
    return sessionStartIsos.filter((iso) => Date.parse(iso) >= KELLYVILLE_TERM3_START_MS).length;
  }
  return sessionStartIsos.length;
}

// Trials are only bookable for a class whose next session is within this many
// days (keeps trials near-term, not booked weeks ahead). Widened 14 → 21 for
// the Term 3 launch so West Ryde (first session 24 Jul) opens with Kellyville.
export const TRIAL_WINDOW_DAYS = 21;

// Casual / drop-in rate for a single junior class (vs $36/week on the full term).
// Term is marketed as the saving, never casual as a surcharge.
export const CASUAL_PRICE_CENTS = 4000;

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
