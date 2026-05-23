import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/auth";

export async function POST() {
  const supa = await supabaseServer();
  await supa.auth.signOut();
  return NextResponse.redirect(
    new URL("/booking/portal", process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidian-booking-staging.vercel.app")
  );
}
