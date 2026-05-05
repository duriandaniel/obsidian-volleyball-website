"use client";

import { trackBookingClick, type BookingTier, type BookingLocation } from "@/lib/tracking";

interface TrackedBookingLinkProps {
  tier?: BookingTier;
  location: BookingLocation;
  className?: string;
  children: React.ReactNode;
  /**
   * Optional Acuity URL override. If omitted, falls back to the default
   * Acuity page (NEXT_PUBLIC_ACUITY_URL env var, then root domain).
   * Use this to deep-link into a specific appointment type or category.
   */
  href?: string;
}

const DEFAULT_ACUITY_URL =
  process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me";

export default function TrackedBookingLink({
  tier = "general",
  location,
  className,
  children,
  href,
}: TrackedBookingLinkProps) {
  return (
    <a
      href={href || DEFAULT_ACUITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackBookingClick(tier, location)}
    >
      {children}
    </a>
  );
}
