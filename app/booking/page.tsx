import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book a Camp or Class | Obsidian Volleyball Academy",
  description: "Book holiday camps and term sessions with Obsidian Volleyball Academy.",
  robots: { index: false, follow: false },
};

export default function BookingHomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">BOOKING</p>
        <h1 className="font-heading text-4xl md:text-5xl tracking-wide mb-6">
          What would you like to book?
        </h1>
        <p className="text-gray-400 mb-12 text-lg">
          Holiday camps run during NSW school holidays. Term sessions run weekly throughout the school term.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/booking/camps"
            className="block border border-[#9B4FDE]/30 hover:border-[#9B4FDE] rounded-lg p-8 transition-colors"
          >
            <div className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">HOLIDAY CAMPS</div>
            <h2 className="font-heading text-2xl mb-3">Pick your camp days</h2>
            <p className="text-gray-400 text-sm">
              Choose individual days or save with the 5-day package. Half-day and full-day options available.
            </p>
          </Link>

          <Link
            href="/booking/term"
            className="block border border-[#9B4FDE]/30 hover:border-[#9B4FDE] rounded-lg p-8 transition-colors"
          >
            <div className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">TERM SESSIONS</div>
            <h2 className="font-heading text-2xl mb-3">Weekly term classes</h2>
            <p className="text-gray-400 text-sm">
              Commit to the whole term, or join mid-term at a pro-rata price.
            </p>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-sm text-gray-500">
          <p>
            Need to manage an existing booking?{" "}
            <Link href="/booking/portal" className="text-[#9B4FDE] hover:text-white">
              Sign in to your account
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
