"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { useMemo } from "react";

// Lazily load Stripe.js once per page (idempotent across re-mounts).
let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    stripePromise = loadStripe(key ?? "");
  }
  return stripePromise;
}

// Renders Stripe's embedded Checkout form inline so parents never leave the
// booking page. Stripe handles all card data inside an iframe — we never see
// it, so we keep our PCI scope at zero.
export function EmbeddedPayment({ clientSecret }: { clientSecret: string }) {
  // Memoize so re-renders of the parent don't tear down the iframe
  const options = useMemo(() => ({ clientSecret }), [clientSecret]);

  return (
    <div id="ova-stripe-embedded" className="mt-2 -mx-2">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
