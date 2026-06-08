import type { Metadata } from "next";
import Link from "next/link";
import PurchasePixel from "@/components/PurchasePixel";
import { getPurchaseForSession } from "@/lib/meta/purchase";

export const metadata: Metadata = {
  title: "Jersey Order Confirmed | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export default async function JerseySuccessPage({
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
        <PurchasePixel value={purchase.value} currency={purchase.currency} eventId={purchase.eventId} contentName="jersey_purchase" />
      )}
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="font-heading text-4xl mb-4">Order confirmed.</h1>
        <p className="text-gray-400 mb-8">
          Payment received. A confirmation email with your jersey details is on its way.
        </p>

        {sessionId && <p className="text-xs text-gray-600 mb-8">Stripe ref: {sessionId}</p>}

        <div className="border border-white/10 rounded-lg p-6 text-left text-sm text-gray-400 mb-8">
          <h2 className="font-heading text-white text-lg mb-3">What happens next?</h2>
          <ul className="space-y-2">
            <li>We&apos;ll be in touch about getting your jersey to you.</li>
            <li>Questions about sizing or collection? Just reply to your confirmation email.</li>
          </ul>
        </div>

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
