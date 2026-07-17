import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adult Sessions | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export default function AdultBookingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/booking" className="text-xs text-gray-500 hover:text-white tracking-wider uppercase">← Back</Link>
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mt-4 mb-1">Adults</h1>
        <p className="text-sm text-gray-500 mb-10">18+ · West Ryde</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdultBox
            href="/booking/adult/scrim"
            eyebrow="DROP IN"
            label="Social Scrims"
            blurb="Casual mixed nights — pay per night, come when you can."
          />
          <AdultBox
            href="/booking/mens-squad"
            eyebrow="TRIAL"
            label="Men's Trials"
            blurb="Positional tryout for the Men's Development Squad. Trial spots are limited."
          />
        </div>
      </div>
    </div>
  );
}

function AdultBox({ href, eyebrow, label, blurb }: { href: string; eyebrow: string; label: string; blurb: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col bg-white/[0.04] border border-white/10 hover:border-[#7E57C2]/50 rounded-xl p-8 min-h-[200px]"
    >
      <div className="text-[#7E57C2] font-heading text-sm tracking-[0.3em] mb-3">{eyebrow}</div>
      <div className="font-heading text-2xl leading-tight mb-3">{label}</div>
      <p className="text-sm text-gray-400 leading-relaxed">{blurb}</p>
    </Link>
  );
}
