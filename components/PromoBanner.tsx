"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackBookingClick } from "@/lib/tracking";

// Promote holiday camp bookings; send straight to the camp funnel.
const BOOKING_URL = "/booking/camps";

export default function PromoBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith("/booking")) return null;
  return (
    <Link
      href={BOOKING_URL}
      onClick={() => trackBookingClick("general", "promo_banner")}
      className="fixed top-0 left-0 right-0 z-[60] block bg-[#482971] hover:bg-[#5E35A8] transition-colors duration-300 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 py-1.5 text-center">
        <p className="text-sm sm:text-base font-heading text-white tracking-[0.2em] uppercase">
          <span>Holiday Camp Bookings Open</span>
          <span
            className="text-[#D4A4FF] mx-2 sm:mx-3 inline-block align-middle text-[8px]"
            aria-hidden
          >
            ●
          </span>
          <span>Any 5 Days for $250</span>
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
