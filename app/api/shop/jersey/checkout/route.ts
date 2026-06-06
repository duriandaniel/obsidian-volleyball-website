import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { CAMP_JERSEY_CENTS } from "@/lib/booking/pricing";

const Body = z.object({
  quantity: z.number().int().min(1).max(10).default(1),
  buyer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().max(40).optional().nullable(),
  }),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    const msg = err instanceof z.ZodError ? err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") : "Invalid";
    return NextResponse.json({ error: `Invalid request: ${msg}` }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const qty = body.quantity ?? 1;
  const totalCents = CAMP_JERSEY_CENTS * qty; // authoritative price, server-side

  // Upsert the buyer as a customer.
  const email = body.buyer.email.toLowerCase();
  const parts = body.buyer.name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  let customerId: string;
  {
    const { data: existing } = await sb.from("customers").select("id").eq("email", email).is("deleted_at", null).maybeSingle();
    const fields = { first_name: firstName, last_name: lastName, phone: body.buyer.phone || null };
    if (existing) {
      customerId = existing.id;
      await sb.from("customers").update(fields).eq("id", customerId);
    } else {
      const { data: created, error: cErr } = await sb.from("customers").insert({ email, ...fields }).select("id").single();
      if (cErr) return NextResponse.json({ error: "Could not save your details" }, { status: 500 });
      customerId = created.id;
    }
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
        quantity: qty,
      },
    ],
    customer_email: email,
    return_url: `${appUrl}/shop/jersey/success?session_id={CHECKOUT_SESSION_ID}${bypassQS}`,
    metadata: {
      booking_type: "jersey",
      customer_id: customerId,
      jersey_size: "TBC",
      jersey_qty: String(qty),
      jersey_cents: String(totalCents),
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ client_secret: checkout.client_secret, session_id: checkout.id });
}
