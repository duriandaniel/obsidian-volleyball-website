import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/auth";
import { clearSimpleAdminCookie } from "@/lib/admin/simple-auth";

export async function POST() {
  await clearSimpleAdminCookie();
  // Also clear any legacy Supabase session
  try {
    const supa = await supabaseServer();
    await supa.auth.signOut();
  } catch {
    // ignore — simple-cookie users won't have a Supabase session
  }
  return NextResponse.redirect(
    new URL("/admin/login", process.env.NEXT_PUBLIC_APP_URL ?? "https://obsidian-volleyball-staging.vercel.app")
  );
}
