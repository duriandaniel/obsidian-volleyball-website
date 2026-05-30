import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book | Obsidian Volleyball Academy",
  description: "Book holiday camps and weekly classes with Obsidian Volleyball Academy.",
  robots: { index: false, follow: false },
};

export default function BookingHomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-heading text-3xl md:text-4xl tracking-wide mb-10 text-center">
          What would you like to book?
        </h1>

        <div className="grid gap-5 sm:grid-cols-3">
          <BookingBox href="/booking/camps" eyebrow="HOLIDAY" label="Holiday Camp" />
          <BookingBox href="/booking/term/junior" eyebrow="AGES 8–18" label="Junior Weekly Classes" />
          <BookingBox href="/booking/adult" eyebrow="18+ DROP-IN" label="Adult Sessions" />
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <Link href="/booking/portal" className="text-[#9B4FDE] hover:text-white">
            Manage an existing booking
          </Link>
        </div>
      </div>
    </div>
  );
}

function BookingBox({ href, eyebrow, label }: { href: string; eyebrow: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center text-center bg-white/[0.04] border border-white/10 hover:border-[#9B4FDE]/50 rounded-xl py-14 px-5 min-h-[180px]"
    >
      <div className="text-[#9B4FDE] font-heading text-xs tracking-[0.35em] mb-3">{eyebrow}</div>
      <div className="font-heading text-2xl leading-tight">{label}</div>
    </Link>
  );
}
