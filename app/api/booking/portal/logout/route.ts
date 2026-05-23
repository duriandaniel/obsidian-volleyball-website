import { NextResponse } from "next/server";
import { PORTAL_COOKIE } from "@/lib/auth/portal";

export async function POST() {
  const res = NextResponse.redirect(
    new URL("/booking/portal", process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidian-booking-staging.vercel.app")
  );
  res.cookies.delete(PORTAL_COOKIE);
  return res;
}
