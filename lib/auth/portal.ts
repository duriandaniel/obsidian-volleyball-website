import { cookies } from "next/headers";
import { signRecoveryToken, verifyRecoveryToken } from "./token";

// Self-contained parent session — no Supabase Auth dependency.
// The same HMAC-signed token is used for both the email magic link and the
// browser cookie. Token contains customer_id + expiry, signed with
// SUPABASE_SECRET_KEY.

export const PORTAL_COOKIE = "ova_portal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function signPortalToken(customerId: string): string {
  // We reuse the recovery token helper since the format is identical.
  return signRecoveryToken(customerId, SESSION_TTL_SECONDS);
}

export function verifyPortalToken(token: string | undefined | null): string | null {
  if (!token) return null;
  const payload = verifyRecoveryToken(token);
  return payload?.customer_id ?? null;
}

// Read the parent's customer_id from their session cookie.
// Returns null if no cookie, invalid signature, or expired.
export async function currentPortalCustomerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const c = cookieStore.get(PORTAL_COOKIE);
  return verifyPortalToken(c?.value ?? null);
}
