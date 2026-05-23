import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Booking Confirmed | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export default async function CampSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id ?? null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="text-5xl mb-6">✓</div>
        <h1 className="font-heading text-4xl mb-4">You&apos;re in.</h1>
        <p className="text-gray-400 mb-8">
          Payment received. A confirmation email is on its way to your inbox.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-600 mb-8">Stripe ref: {sessionId}</p>
        )}

        <div className="border border-white/10 rounded-lg p-6 text-left text-sm text-gray-400 mb-8">
          <h2 className="font-heading text-white text-lg mb-3">What happens next?</h2>
          <ul className="space-y-2">
            <li>We&apos;ll email your booking confirmation with venue details.</li>
            <li>You&apos;ll get a reminder 24 hours before your first day.</li>
            <li>Bring water, runners, and a snack. Volleyball gear provided.</li>
            <li>
              Need to update your child&apos;s details (school, level, medical notes)? Reply to
              the confirmation email and we&apos;ll add it.
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block bg-[#9B4FDE] hover:bg-[#7d3fb8] text-white font-heading text-sm tracking-[0.2em] px-6 py-3 rounded transition-colors"
        >
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}
