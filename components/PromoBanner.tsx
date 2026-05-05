"use client";

import { trackBookingClick } from "@/lib/tracking";

const ACUITY_URL =
  process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me";

export default function PromoBanner() {
  return (
    <a
      href={ACUITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackBookingClick("general", "promo_banner")}
      className="fixed top-0 left-0 right-0 z-[60] block bg-[#5C1F94] hover:bg-[#7B2FBE] transition-colors duration-300 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 text-center">
        <p className="text-xs sm:text-sm font-heading text-white tracking-[0.2em] uppercase">
          <span>20% Off Opening Sale</span>
          <span
            className="text-[#D4A4FF] mx-2 sm:mx-3 inline-block align-middle text-[8px]"
            aria-hidden
          >
            ●
          </span>
          <span>
            Use Code <span className="text-[#D4A4FF]">OPEN20</span>
          </span>
          <span
            className="hidden md:inline-block ml-3 lg:ml-4 text-[#D4A4FF] tracking-[0.2em]"
            aria-hidden
          >
            Book Now &rarr;
          </span>
        </p>
      </div>
    </a>
  );
}
