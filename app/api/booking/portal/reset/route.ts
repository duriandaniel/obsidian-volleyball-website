import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";

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

  // Check we actually have a customer with this email (don't email arbitrary addresses)
  const { data: customer } = await sb
    .from("customers")
    .select("id, auth_user_id")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer) {
    // Return 200 anyway to avoid leaking which emails exist
    return NextResponse.json({ ok: true });
  }

  const reqUrl = new URL(req.url);
  const bypass = reqUrl.searchParams.get("x-vercel-protection-bypass");
  const bypassQS = bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : "";
  const redirectTo = `${reqUrl.protocol}//${reqUrl.host}/booking/portal/set-password${bypassQS}`;

  // If they don't have an auth user yet, create one with a random password so
  // the recovery link will set their first real password.
  if (!customer.auth_user_id) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const secret = process.env.SUPABASE_SECRET_KEY!;
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: secret,
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: crypto.randomUUID(),
          email_confirm: true,
        }),
      });
      const createJson = await createRes.json();
      if (createJson?.id) {
        await sb.from("customers").update({ auth_user_id: createJson.id }).eq("id", customer.id);
      }
    } catch {
      // If create fails (e.g. user already exists), ignore and proceed to recovery
    }
  }

  // Generate a recovery link via admin API (doesn't send the email, returns it)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const secret = process.env.SUPABASE_SECRET_KEY!;
    const linkRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: "POST",
      headers: {
        apikey: secret,
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "recovery",
        email,
        options: { redirect_to: redirectTo },
      }),
    });
    const linkJson = await linkRes.json();
    const link = linkJson?.properties?.action_link ?? linkJson?.action_link;
    if (link) {
      const { sendEmail } = await import("@/lib/email/send");
      await sendEmail({
        to: email,
        subject: "Set your Obsidian Volleyball Academy password",
        template: "portal_set_password",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #9B4FDE;">Set your password</h2>
            <p>Click the link below to set a password and access your bookings.</p>
            <p><a href="${link}" style="display:inline-block; background:#9B4FDE; color:white; padding:12px 20px; border-radius:6px; text-decoration:none;">Set password</a></p>
            <p style="font-size: 12px; color: #666;">If you didn't request this, you can ignore this email.</p>
            <p style="font-size: 12px; color: #666;">— Obsidian Volleyball Academy</p>
          </div>
        `,
        text: `Set your Obsidian Volleyball Academy password: ${link}`,
      });
    }
  } catch (err) {
    console.error("portal reset email failed", err);
  }

  return NextResponse.json({ ok: true });
}
