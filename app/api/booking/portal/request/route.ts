import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { signPortalToken } from "@/lib/auth/portal";

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

  const { data: customer } = await sb
    .from("customers")
    .select("id, first_name")
    .eq("email", email)
    .is("deleted_at", null)
    .maybeSingle();

  // Return ok even if no customer — don't leak which emails are registered
  if (!customer) {
    return NextResponse.json({ ok: true });
  }

  const reqUrl = new URL(req.url);
  const bypass = reqUrl.searchParams.get("x-vercel-protection-bypass");
  const bypassQS = bypass
    ? `&x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true`
    : "";

  const token = signPortalToken(customer.id);
  const link = `${reqUrl.protocol}//${reqUrl.host}/api/booking/portal/access?token=${encodeURIComponent(token)}${bypassQS}`;

  try {
    await sendEmail({
      to: email,
      subject: "Your Obsidian Volleyball Academy sign-in link",
      template: "portal_access_link",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #9B4FDE;">Manage your bookings</h2>
          <p>Hi${customer.first_name ? ' ' + customer.first_name : ''},</p>
          <p>Click the button below to sign in and manage your bookings. The link is valid for 30 days, so you can come back to this email later.</p>
          <p><a href="${link}" style="display:inline-block; background:#9B4FDE; color:white; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight: 600;">Sign in to my bookings</a></p>
          <p style="font-size: 12px; color: #666;">Or paste this URL into your browser:<br><span style="word-break: break-all;">${link}</span></p>
          <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email — nothing was changed.</p>
          <p style="font-size: 12px; color: #666;">— Obsidian Volleyball Academy</p>
        </div>
      `,
      text: `Sign in to manage your Obsidian Volleyball Academy bookings:\n\n${link}\n\nValid for 30 days.`,
    });
  } catch (err) {
    console.error("portal link email failed", err);
    return NextResponse.json({ error: "Could not send link. Please try again or contact us." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
