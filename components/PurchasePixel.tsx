"use client";

import { useEffect, useRef } from "react";

// Fires the Meta Pixel "Purchase" event once on a booking success page.
// `eventId` is the Stripe Checkout Session id, shared with the server-side
// Conversions API event so Meta de-duplicates the two into one conversion.
export default function PurchasePixel({
  value,
  currency,
  eventId,
  contentName,
  contentCategory,
}: {
  value: number;
  currency: string;
  eventId: string;
  contentName: string;
  contentCategory?: string;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (typeof window === "undefined" || !window.fbq) return;
    window.fbq(
      "track",
      "Purchase",
      { value, currency, content_name: contentName, ...(contentCategory ? { content_category: contentCategory } : {}) },
      { eventID: eventId }
    );
  }, [value, currency, eventId, contentName, contentCategory]);
  return null;
}
