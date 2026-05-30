"use client";

import { useEffect } from "react";
import { trackConversionComplete } from "@/lib/tracking";
import Link from "next/link";

export default function ThankYouPage() {
  useEffect(() => {
    trackConversionComplete();
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-[#0A0A0A]">
      {/* Hero */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#5E35A8]/20 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7E57C2" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">BOOKING CONFIRMED</p>
            <h1 className="font-heading text-5xl sm:text-7xl text-white tracking-wide mb-6 leading-[0.9]">
              YOU&apos;RE
              <br />
              <span className="text-[#7E57C2]">BOOKED IN</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto">
              Check your email for a confirmation from Acuity Scheduling with all the details.
            </p>
          </div>
        </div>
      </section>

      {/* What to bring */}
      <section className="py-16 lg:py-24 bg-[#111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl text-white tracking-wide mb-8">WHAT TO BRING</h2>
          <ul className="space-y-4">
            {[
              "Shoes suitable for volleyball",
              "Water bottle",
              "Lunch and snacks for full-day camps",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-gray-400">
                <span className="text-[#7E57C2] font-heading text-lg flex-shrink-0 w-6">{i + 1}</span>
                <span className="text-sm leading-relaxed pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Venue info */}
      <section className="py-16 lg:py-24 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl text-white tracking-wide mb-6">VENUE</h2>
          <address className="not-italic space-y-2 mb-6">
            <p className="text-white text-lg">Baulkham Hills High School</p>
            <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills, NSW 2153</p>
          </address>
          <p className="text-gray-600 text-sm mb-6">
            Free parking on-site.
          </p>
          <a
            href="https://www.google.com/maps/place/Obsidian+Volleyball+Academy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#7E57C2] text-sm font-medium hover:text-white transition-colors"
          >
            Get directions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </section>

      {/* Share */}
      <section className="py-16 lg:py-24 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">SPREAD THE WORD</p>
          <h2 className="font-heading text-3xl text-white tracking-wide mb-6">KNOW SOMEONE WHO&apos;D LOVE OBSIDIAN?</h2>
          <p className="text-gray-500 text-sm mb-8">Share with a friend. The more the merrier on court.</p>
          <div className="flex gap-4 justify-center">
            <a
              href="https://instagram.com/obsidianvolleyball"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 text-white font-heading text-lg px-8 py-3 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide"
            >
              FOLLOW US
            </a>
            <Link
              href="/"
              className="text-gray-500 font-heading text-lg px-8 py-3 hover:text-white transition-colors tracking-wide"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
