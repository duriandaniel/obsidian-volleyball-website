import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { signRecoveryToken } from "@/lib/auth/token";

const Body = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = body.email.toLowerCase();
  const sb = supabaseAdmin();

  // Look up the customer. If they don't exist, return ok anyway (don't leak which emails exist).
  const { data: customer } = await sb
    .from("customers")
    .select("id, auth_user_id, first_name")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer) {
    return NextResponse.json({ ok: true });
  }

  // Ensure a Supabase auth user exists for this customer so we can set their password later.
  if (!customer.auth_user_id) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const secret = process.env.SUPABASE_SECRET_KEY!;
      // Create with a throwaway password; the recovery flow will set the real one.
      const tmpPass = crypto.randomUUID() + "-" + crypto.randomUUID();
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: secret,
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: tmpPass, email_confirm: true }),
      });
      const createJson = await createRes.json();
      const userId = createJson?.id ?? createJson?.user?.id;
      if (userId) {
        await sb.from("customers").update({ auth_user_id: userId }).eq("id", customer.id);
      }
    } catch (err) {
      console.error("portal reset: auth user create failed", err);
    }
  }

  // Build our own signed recovery link. Doesn't depend on Supabase URL config.
  const reqUrl = new URL(req.url);
  const bypass = reqUrl.searchParams.get("x-vercel-protection-bypass");
  const bypassQS = bypass
    ? `&x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true`
    : "";

  const token = signRecoveryToken(customer.id);
  const link = `${reqUrl.protocol}//${reqUrl.host}/booking/portal/set-password?token=${encodeURIComponent(token)}${bypassQS}`;

  try {
    await sendEmail({
      to: email,
      subject: "Set your Obsidian Volleyball Academy password",
      template: "portal_set_password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #9B4FDE;">Set your password</h2>
          <p>Hi${customer.first_name ? ' ' + customer.first_name : ''},</p>
          <p>Click the link below to set a password and manage your Obsidian bookings online. The link is valid for 24 hours.</p>
          <p><a href="${link}" style="display:inline-block; background:#9B4FDE; color:white; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight: 600;">Set password</a></p>
          <p style="font-size: 12px; color: #666;">Or paste this URL into your browser:<br><span style="word-break: break-all;">${link}</span></p>
          <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          <p style="font-size: 12px; color: #666;">— Obsidian Volleyball Academy</p>
        </div>
      `,
      text: `Set your Obsidian Volleyball Academy password:\n\n${link}\n\nValid for 24 hours.`,
    });
  } catch (err) {
    console.error("portal reset email failed", err);
    return NextResponse.json({ error: "Could not send reset email. Please try again or contact us." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
