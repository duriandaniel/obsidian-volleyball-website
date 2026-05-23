import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// Health endpoint for smoke-testing the booking system stack.
// Returns 200 if env vars are present and Supabase is reachable.
// Does NOT touch Stripe (avoid wasting API calls).
export const dynamic = "force-dynamic";

export async function GET() {
  const envs = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: !!process.env.SUPABASE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    SMTP_HOST: !!process.env.SMTP_HOST,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASSWORD: !!process.env.SMTP_PASSWORD,
    NEXT_PUBLIC_SENTRY_DSN: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  };

  let dbReachable = false;
  let dbError: string | null = null;
  let schemaReady = false;
  try {
    const sb = supabaseAdmin();
    // Use a non-HEAD request so PostgREST returns errors properly for missing tables
    const { error } = await sb.from("venues").select("id").limit(1);
    if (error) {
      dbError = error.message;
      // "Could not find the table 'public.X'" is PostgREST's missing-table error.
      const isMissingTable =
        error.code === "PGRST205" ||
        /could not find the table|relation .* does not exist/i.test(error.message);
      dbReachable = !isMissingTable;
      schemaReady = !isMissingTable;
    } else {
      dbReachable = true;
      schemaReady = true;
    }
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }

  const allEnvsPresent = Object.values(envs).every(Boolean);

  return NextResponse.json({
    ok: allEnvsPresent && dbReachable && schemaReady,
    envs,
    db: { reachable: dbReachable, schemaReady, error: dbError },
    deployed_at: new Date().toISOString(),
  });
}
