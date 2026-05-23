import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyRecoveryToken } from "@/lib/auth/token";
import { supabaseAdmin } from "@/lib/supabase/server";
import { supabaseServer } from "@/lib/supabase/auth";

const Body = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const payload = verifyRecoveryToken(body.token);
  if (!payload) {
    return NextResponse.json({ error: "Link expired or invalid. Request a new one." }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: customer } = await sb
    .from("customers")
    .select("id, email, auth_user_id")
    .eq("id", payload.customer_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer || !customer.auth_user_id) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // Update the password via the Supabase Auth admin API
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secret = process.env.SUPABASE_SECRET_KEY!;
  const updRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${customer.auth_user_id}`, {
    method: "PUT",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password: body.password, email_confirm: true }),
  });
  if (!updRes.ok) {
    const errBody = await updRes.text();
    console.error("set-password update failed", errBody);
    return NextResponse.json({ error: "Could not set password" }, { status: 500 });
  }

  // Sign them in so they land on the portal authenticated
  const supa = await supabaseServer();
  const { error: signErr } = await supa.auth.signInWithPassword({
    email: customer.email,
    password: body.password,
  });
  if (signErr) {
    // Even if sign-in fails (shouldn't), the password is set and they can use sign-in form
    return NextResponse.json({ ok: true, signed_in: false });
  }

  await sb.from("audit_log").insert({
    actor_user_id: customer.auth_user_id,
    actor_email: customer.email,
    actor_role: "parent",
    action: "password.set",
    entity_type: "customer",
    entity_id: customer.id,
  });

  return NextResponse.json({ ok: true, signed_in: true });
}
