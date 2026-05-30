"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackBookingClick } from "@/lib/tracking";

// New junior players land on the on-site junior class funnel.
const BOOKING_URL = "/booking/term/junior";

export default function PromoBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/booking")) return null;
  return (
    <Link
      href={BOOKING_URL}
      onClick={() => trackBookingClick("general", "promo_banner")}
      className="fixed top-0 left-0 right-0 z-[60] block bg-[#5C1F94] hover:bg-[#7B2FBE] transition-colors duration-300 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 text-center">
        <p className="text-xs sm:text-sm font-heading text-white tracking-[0.2em] uppercase">
          <span>Opening Promotion</span>
          <span
            className="text-[#D4A4FF] mx-2 sm:mx-3 inline-block align-middle text-[8px]"
            aria-hidden
          >
            ●
          </span>
          <span>Free Jersey for New Junior Players</span>
          <span
            className="hidden md:inline-block ml-3 lg:ml-4 text-[#D4A4FF] tracking-[0.2em]"
            aria-hidden
          >
            Book Now &rarr;
          </span>
        </p>
      </div>
    </Link>
  );
}
