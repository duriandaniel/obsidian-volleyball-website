import type { Metadata } from "next";
import Link from "next/link";
import PurchasePixel from "@/components/PurchasePixel";
import { getPurchaseForSession } from "@/lib/meta/purchase";

export const metadata: Metadata = {
  title: "Booking Confirmed | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export default async function AdultSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id ?? null;
  const purchase = await getPurchaseForSession(sessionId);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      {purchase && (
        <PurchasePixel value={purchase.value} currency={purchase.currency} eventId={purchase.eventId} contentName="adult_scrim" />
      )}
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="font-heading text-4xl mb-4">You&apos;re booked in.</h1>
        <p className="text-gray-400 mb-8">Payment approved. We&apos;re confirming your spot now — your confirmation email is on its way.</p>
        {sessionId && <p className="text-xs text-gray-600 mb-8">Stripe ref: {sessionId}</p>}
        <p className="text-sm text-gray-400 mb-10">Wear suitable indoor court shoes. See you on court.</p>
        <Link
          href="/"
          className="inline-block bg-[#7E57C2] hover:bg-[#4A2780] text-white font-heading text-sm tracking-[0.2em] px-6 py-3 rounded transition-colors"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
