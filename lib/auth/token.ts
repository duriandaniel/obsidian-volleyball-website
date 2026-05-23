import crypto from "crypto";

// Self-signed time-limited tokens for the parent password-recovery flow.
// We don't use Supabase's built-in recovery link because it depends on the
// project's Site URL setting (which defaults to localhost and is hard to set
// without a Personal Access Token).
//
// Format: base64url(payload).base64url(hmac_sha256(payload, secret))
// Payload is JSON: { customer_id, exp, purpose }

type Payload = {
  customer_id: string;
  exp: number; // unix seconds
  purpose: "password_reset" | "portal_access";
};

function getSecret(): string {
  const s = process.env.SUPABASE_SECRET_KEY;
  if (!s) throw new Error("SUPABASE_SECRET_KEY not configured");
  return s;
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export function signRecoveryToken(customerId: string, ttlSeconds = 60 * 60 * 24): string {
  const payload: Payload = {
    customer_id: customerId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    purpose: "portal_access",
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(Buffer.from(payloadStr));
  const sig = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
  const sigB64 = b64urlEncode(sig);
  return `${payloadB64}.${sigB64}`;
}

export function verifyRecoveryToken(token: string): Payload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  const expectedSig = crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
  const givenSig = b64urlDecode(sigB64);
  if (expectedSig.length !== givenSig.length) return null;
  if (!crypto.timingSafeEqual(expectedSig, givenSig)) return null;

  let payload: Payload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8"));
  } catch {
    return null;
  }
  if (payload.purpose !== "password_reset" && payload.purpose !== "portal_access") return null;
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (typeof payload.customer_id !== "string") return null;
  return payload;
}
