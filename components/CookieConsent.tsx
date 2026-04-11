"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CONSENT_KEY = "ova-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    // Update GTM consent mode
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "consent_update",
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-[#1a1d27] border border-[#2e3347] rounded-xl p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-white text-sm font-medium mb-1">We use cookies</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              We use analytics and advertising cookies to improve your experience and measure our marketing.{" "}
              <Link href="/privacy" className="text-[#9B4FDE] hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={decline}
              className="text-gray-500 text-sm px-4 py-2 hover:text-white transition-colors"
            >
              Decline
            </button>
            <button
              onClick={accept}
              className="bg-[#7B2FBE] text-white text-sm font-medium px-6 py-2 rounded-lg hover:bg-[#9B4FDE] transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
