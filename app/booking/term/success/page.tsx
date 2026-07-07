import type { Metadata } from "next";
import Link from "next/link";
import PurchasePixel from "@/components/PurchasePixel";
import { getPurchaseForSession } from "@/lib/meta/purchase";

export const metadata: Metadata = {
  title: "Enrolment Confirmed | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export default async function TermSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; free?: string }>;
}) {
  const sp = await searchParams;
  const isFreeTrial = sp.free === "1";
  // Paid flows fire the Purchase pixel; a free trial has no purchase value.
  const purchase = isFreeTrial ? null : await getPurchaseForSession(sp.session_id ?? null);
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      {purchase && (
        <PurchasePixel value={purchase.value} currency={purchase.currency} eventId={purchase.eventId} contentName="term_enrolment" />
      )}
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="font-heading text-4xl mb-4">{isFreeTrial ? "Trial booked." : "You’re enrolled."}</h1>
        <p className="text-gray-400 mb-8">
          {isFreeTrial
            ? "Your free trial class is booked. A confirmation email with the details is on its way."
            : "Payment approved. We're confirming your spot now — a confirmation email with all your class dates is on its way."}
        </p>
        {sp.session_id && <p className="text-xs text-gray-600 mb-8">Stripe ref: {sp.session_id}</p>}
        <div className="border border-white/10 rounded-lg p-6 text-left text-sm text-gray-400 mb-8">
          <h2 className="font-heading text-white text-lg mb-3">What to expect</h2>
          <ul className="space-y-2">
            <li>{isFreeTrial ? "The confirmation email has your trial class date and venue." : "The confirmation email lists every class date for the term."}</li>
            <li>Wear suitable indoor court shoes. We provide all volleyball gear.</li>
            <li>Questions or changes? Just reply to your confirmation email and we&apos;ll help.</li>
          </ul>
        </div>
        <Link href="/" className="inline-block bg-[#7E57C2] hover:bg-[#4A2780] text-white font-heading text-sm tracking-[0.2em] px-6 py-3 rounded">
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
