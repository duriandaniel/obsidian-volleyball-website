"use client";

import { useEffect } from "react";
import { trackBookingClick } from "@/lib/tracking";

const BOOKING_URL = "/booking";

export default function BookPage() {
  useEffect(() => {
    trackBookingClick("general", "book_page");
    window.location.href = BOOKING_URL;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
      <div className="text-center">
        <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">REDIRECTING</p>
        <h1 className="font-heading text-4xl text-white tracking-wide mb-4">Taking you to booking...</h1>
        <p className="text-gray-500 text-sm">
          If you&apos;re not redirected,{" "}
          <a href={BOOKING_URL} className="text-[#7E57C2] hover:text-white transition-colors">
            click here
          </a>
        </p>
      </div>
    </div>
  );
}
