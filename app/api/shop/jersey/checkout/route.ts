import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/server";
import { CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";

// Minimal on-the-spot purchase: one jersey, child's name + email. The email is
// pinned on the Stripe session so the webhook keys the customer record off it
// (matching any existing booking) and links the jersey to a participant row
// for the child so fulfilment knows who it's for.
const Body = z.object({
  email: z.string().email(),
  child_name: z.string().min(1).max(120),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid request: ${msg}` }, { status: 400 });
  }

  const reqUrl = new URL(req.url);
  const appUrl = `${reqUrl.protocol}//${reqUrl.host}`;
  const bypass = reqUrl.searchParams.get("x-vercel-protection-bypass");
  const bypassQS = bypass
    ? `&x-vercel-protection-bypass=${encodeURIComponent(bypass)}&x-vercel-set-bypass-cookie=true`
    : "";

  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded_page",
    payment_method_types: ["card"],
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: { name: "Obsidian training jersey" },
          unit_amount: CAMP_JERSEY_CENTS,
        },
        quantity: 1,
      },
    ],
    customer_email: body.email.toLowerCase(),
    return_url: `${appUrl}/shop/jersey/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "jersey",
      jersey_size: "TBC",
      jersey_qty: "1",
      jersey_cents: String(CAMP_JERSEY_CENTS),
      jersey_child_name: body.child_name.trim(),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
