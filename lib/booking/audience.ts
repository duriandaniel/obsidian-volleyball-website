// Audience classification for term-type programs.
//
// We don't (yet) have a dedicated `audience` column on `programs` — adding one
// needs a DB migration we can't run from this environment. Instead we derive it
// from the program's minimum age, which is already an honest signal: adult
// social scrims are 18+, junior classes are 8-18. Promote this to a real column
// at production cutover when DB credentials are available, then swap the body of
// isAdultProgram() to read the column.
//
// Booking mode (drop-in vs whole-term commit) is implicit in the flow: adults
// go through /booking/term/adult + /api/booking/dropin/checkout (pay per night),
// juniors go through /booking/term/junior + /api/booking/term/checkout (pay for
// the remaining weeks of term).

export const ADULT_MIN_AGE = 16;

export type AudienceLike = { age_min: number | null };

export function isAdultProgram(p: AudienceLike): boolean {
  return (p.age_min ?? 0) >= ADULT_MIN_AGE;
}
