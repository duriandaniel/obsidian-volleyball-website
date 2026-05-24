import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "ova_admin";
const TOKEN_SALT = "ova-admin-v1";

export function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(pw + TOKEN_SALT).digest("hex");
}

export function tokenForPassword(pw: string): string {
  return createHash("sha256").update(pw + TOKEN_SALT).digest("hex");
}

export async function hasValidSimpleAdminCookie(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const c = (await cookies()).get(COOKIE_NAME)?.value;
  if (!c) return false;
  try {
    const a = Buffer.from(c, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function setSimpleAdminCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSimpleAdminCookie(): Promise<void> {
  (await cookies()).set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function verifyPassword(submitted: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = Buffer.from(submitted);
  const b = Buffer.from(pw);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const SYNTHETIC_ADMIN = {
  id: "00000000-0000-0000-0000-000000000000",
  auth_user_id: "00000000-0000-0000-0000-000000000000",
  email: "obsidianvolleyball@gmail.com",
  role: "owner" as const,
};
