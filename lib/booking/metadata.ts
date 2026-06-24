// Stripe Checkout metadata helpers.
//
// Stripe caps each metadata VALUE at 500 characters (it allows up to 50 keys).
// A booking that carries a list of session UUIDs blows past that limit fast:
// each UUID is 36 chars, so a 2-week holiday camp (10 days) is ~370 chars and a
// full cart (the zod max of 20) is ~740. When the value is too long Stripe
// rejects checkout.sessions.create(), the route throws, and the booking page
// showed parents a cryptic "JSON.parse: unexpected end of data" (an empty 500).
//
// packChunked() splits a long value across numbered keys (key, key_1, key_2 …)
// and readChunked() reassembles it in the webhook. Short values stay on the
// single base key, so old sessions created before this change still read back
// unchanged (backward compatible).

const MAX_VALUE = 450; // headroom under Stripe's 500-char limit

// Split `value` across `key`, `key_1`, `key_2` … so no single metadata value
// exceeds Stripe's limit. Returns an object to spread into `metadata`.
export function packChunked(key: string, value: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (value.length <= MAX_VALUE) {
    out[key] = value;
    return out;
  }
  for (let i = 0, k = 0; i < value.length; i += MAX_VALUE, k++) {
    out[k === 0 ? key : `${key}_${k}`] = value.slice(i, i + MAX_VALUE);
  }
  return out;
}

// Reassemble a value written by packChunked(). Concatenates `key`, `key_1`,
// `key_2` … in order until a numbered key is missing.
export function readChunked(
  metadata: Record<string, string> | null | undefined,
  key: string
): string {
  if (!metadata) return "";
  let out = metadata[key] ?? "";
  for (let k = 1; metadata[`${key}_${k}`] != null; k++) {
    out += metadata[`${key}_${k}`];
  }
  return out;
}
