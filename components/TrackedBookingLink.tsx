"use client";

import { trackBookingClick, type BookingTier, type BookingLocation } from "@/lib/tracking";

interface TrackedBookingLinkProps {
  tier?: BookingTier;
  location: BookingLocation;
  className?: string;
  children: React.ReactNode;
  /**
   * Optional href override. If omitted, sends to the on-site booking funnel
   * (/booking). Pass a deep-link (e.g. "/booking/term/adult") to skip a step,
   * or an external Acuity URL for flows not yet on the new system (free trials).
   */
  href?: string;
}

// Default: the new on-site booking funnel.
const DEFAULT_BOOKING_URL = "/booking";

export default function TrackedBookingLink({
  tier = "general",
  location,
  className,
  children,
  href,
}: TrackedBookingLinkProps) {
  const target = href || DEFAULT_BOOKING_URL;
  const external = /^https?:\/\//.test(target);
  return (
    <a
      href={target}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
      onClick={() => trackBookingClick(tier, location)}
    >
      {children}
    </a>
  );
}
