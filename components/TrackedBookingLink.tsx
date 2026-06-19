"use client";

import Link from "next/link";
import { trackBookingClick, type BookingTier, type BookingLocation } from "@/lib/tracking";

interface TrackedBookingLinkProps {
  tier?: BookingTier;
  location: BookingLocation;
  className?: string;
  children: React.ReactNode;
  /**
   * Optional href override. If omitted, sends to the on-site booking funnel
   * (/booking). Pass a deep-link (e.g. "/booking/adult") to skip a step.
   */
  href?: string;
  /**
   * Optional extra click handler, run alongside booking tracking (e.g. close
   * the mobile menu before navigating).
   */
  onClick?: () => void;
}

// Default: the new on-site booking funnel.
const DEFAULT_BOOKING_URL = "/booking";

export default function TrackedBookingLink({
  tier = "general",
  location,
  className,
  children,
  href,
  onClick: onClickExtra,
}: TrackedBookingLinkProps) {
  const target = href || DEFAULT_BOOKING_URL;
  const external = /^https?:\/\//.test(target);
  const onClick = () => {
    trackBookingClick(tier, location);
    onClickExtra?.();
  };

  // External (absolute) links open in a new tab; internal links use client-side
  // navigation + prefetch so the booking funnel opens instantly (no full reload).
  if (external) {
    return (
      <a href={target} target="_blank" rel="noopener noreferrer" className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={target} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
