import { NextRequest, NextResponse } from "next/server";
import { PORTAL_COOKIE, verifyPortalToken } from "@/lib/auth/portal";

// GET endpoint hit by the magic-link in the parent's email.
// Validates the token, sets it as an HTTP-only cookie, redirects to the portal.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const bypass = url.searchParams.get("x-vercel-protection-bypass");

  const customerId = verifyPortalToken(token);
  const bypassQS = bypass
    ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}`
    : "";

  if (!customerId) {
    const fallback = new URL(`/booking/portal${bypassQS}${bypassQS ? "&" : "?"}error=expired`, url.origin);
    return NextResponse.redirect(fallback);
  }

  const portalUrl = new URL(`/booking/portal${bypassQS}`, url.origin);
  const res = NextResponse.redirect(portalUrl);
  res.cookies.set(PORTAL_COOKIE, token!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // Match the 30-day token TTL
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
