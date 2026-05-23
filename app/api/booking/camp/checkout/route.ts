import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { priceCampCart } from "@/lib/booking/pricing";

const Body = z.object({
  items: z.array(z.object({ session_id: z.string().uuid(), is_half_day: z.boolean() })).min(1).max(20),
  // Optional pre-collected parent/child details. If absent we collect on success page.
  parent_email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Re-validate sessions exist + are not full + are scheduled
  const sessionIds = body.items.map((i) => i.session_id);
  const { data: sessions, error: sErr } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, program_id, capacity_override, status, programs:program_id(id,title,type,default_capacity)")
    .in("id", sessionIds);

  if (sErr || !sessions || sessions.length !== sessionIds.length) {
    return NextResponse.json({ error: "One or more sessions not found" }, { status: 400 });
  }

  for (const s of sessions) {
    if (s.status !== "scheduled") {
      return NextResponse.json({ error: `Session ${s.id} is not bookable` }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((s.programs as any)?.type !== "camp") {
      return NextResponse.json({ error: `Session ${s.id} is not a camp session` }, { status: 400 });
    }
  }

  // Capacity check
  const { data: existingBookings } = await sb
    .from("bookings")
    .select("session_id")
    .in("session_id", sessionIds)
    .in("status", ["confirmed", "pending"])
    .is("deleted_at", null);
  const counts = new Map<string, number>();
  for (const b of existingBookings ?? []) {
    counts.set(b.session_id, (counts.get(b.session_id) ?? 0) + 1);
  }
  for (const s of sessions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capacity = s.capacity_override ?? (s.programs as any).default_capacity;
    if ((counts.get(s.id) ?? 0) >= capacity) {
      return NextResponse.json({ error: `Session ${s.id} is full` }, { status: 409 });
    }
  }

  const pricing = priceCampCart(body.items);
  if (pricing.total_cents <= 0) {
    return NextResponse.json({ error: "Total must be positive" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Create the Stripe Checkout session.
  // We DON'T create the booking yet — only on webhook confirmation of payment.
  const checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: `Obsidian Volleyball Camp · ${pricing.full_day_equivalents} day${pricing.full_day_equivalents === 1 ? "" : "s"}`,
            description: sessions
              .map((s) => new Date(s.starts_at).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }))
              .join(", "),
          },
          unit_amount: pricing.total_cents,
        },
        quantity: 1,
      },
    ],
    customer_email: body.parent_email,
    success_url: `${appUrl}/booking/camps/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/booking/camps`,
    metadata: {
      booking_type: "camp",
      items: JSON.stringify(body.items),
    },
    // 30 min soft hold; if they don't complete, the session expires and the seat is free
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  return NextResponse.json({ url: checkout.url, session_id: checkout.id });
}
