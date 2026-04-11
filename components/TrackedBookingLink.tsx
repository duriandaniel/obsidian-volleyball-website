"use client";

import { trackBookingClick, type BookingTier, type BookingLocation } from "@/lib/tracking";

interface TrackedBookingLinkProps {
  tier?: BookingTier;
  location: BookingLocation;
  className?: string;
  children: React.ReactNode;
}

const ACUITY_URL = process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me";

export default function TrackedBookingLink({
  tier = "general",
  location,
  className,
  children,
}: TrackedBookingLinkProps) {
  return (
    <a
      href={ACUITY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackBookingClick(tier, location)}
    >
      {children}
    </a>
  );
}
