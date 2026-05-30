"use client";

import { useState, useEffect } from "react";
import { trackBookingClick, trackContactClick, trackConversionComplete } from "@/lib/tracking";

export default function TestTrackingPage() {
  const [events, setEvents] = useState<string[]>([]);
  const [gtmStatus, setGtmStatus] = useState<string>("checking...");
  const [dataLayerStatus, setDataLayerStatus] = useState<string>("checking...");

  useEffect(() => {
    // Check dataLayer
    if (typeof window !== "undefined" && window.dataLayer) {
      setDataLayerStatus(`Active (${window.dataLayer.length} events)`);
    } else {
      setDataLayerStatus("NOT FOUND");
    }

    // Check GTM
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (gtmId) {
      const scripts = document.querySelectorAll("script");
      const gtmLoaded = Array.from(scripts).some((s) => s.src?.includes("googletagmanager.com"));
      setGtmStatus(gtmLoaded ? `Loaded (${gtmId})` : `ID set (${gtmId}) but script not found`);
    } else {
      setGtmStatus("No GTM_ID configured — set NEXT_PUBLIC_GTM_ID env var");
    }
  }, []);

  function fireEvent(name: string, fn: () => void) {
    fn();
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [`${timestamp} — ${name}`, ...prev].slice(0, 20));
    // Update dataLayer count
    if (typeof window !== "undefined" && window.dataLayer) {
      setDataLayerStatus(`Active (${window.dataLayer.length} events)`);
    }
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-heading text-4xl text-white tracking-wide mb-2">Tracking Test Page</h1>
        <p className="text-gray-500 text-sm mb-8">
          Use this page to verify tracking is working. This page is not linked from the main site.
        </p>

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1a1d27] border border-[#2e3347] rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">DATALAYER</p>
            <p className={`font-mono text-sm ${dataLayerStatus.includes("Active") ? "text-green-400" : "text-red-400"}`}>
              {dataLayerStatus}
            </p>
          </div>
          <div className="bg-[#1a1d27] border border-[#2e3347] rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">GOOGLE TAG MANAGER</p>
            <p className={`font-mono text-sm ${gtmStatus.includes("Loaded") ? "text-green-400" : gtmStatus.includes("No GTM") ? "text-yellow-400" : "text-red-400"}`}>
              {gtmStatus}
            </p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-lg p-6 mb-8">
          <h2 className="font-heading text-xl text-white tracking-wide mb-4">Fire Test Events</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => fireEvent("booking_click (hero)", () => trackBookingClick("general", "hero"))}
              className="bg-[#5E35A8] text-white text-sm px-4 py-2 rounded hover:bg-[#7E57C2] transition-colors"
            >
              Book — Hero
            </button>
            <button
              onClick={() => fireEvent("booking_click (5_day_pack)", () => trackBookingClick("5_day_pack", "pricing_package"))}
              className="bg-[#5E35A8] text-white text-sm px-4 py-2 rounded hover:bg-[#7E57C2] transition-colors"
            >
              Book — 5-Day
            </button>
            <button
              onClick={() => fireEvent("booking_click (single_day)", () => trackBookingClick("single_day", "pricing_single"))}
              className="bg-[#5E35A8] text-white text-sm px-4 py-2 rounded hover:bg-[#7E57C2] transition-colors"
            >
              Book — Single
            </button>
            <button
              onClick={() => fireEvent("booking_click (half_day)", () => trackBookingClick("half_day", "pricing_half"))}
              className="bg-[#5E35A8] text-white text-sm px-4 py-2 rounded hover:bg-[#7E57C2] transition-colors"
            >
              Book — Half Day
            </button>
            <button
              onClick={() => fireEvent("contact_click (email)", () => trackContactClick("email"))}
              className="bg-[#3b82f6] text-white text-sm px-4 py-2 rounded hover:bg-blue-400 transition-colors"
            >
              Contact — Email
            </button>
            <button
              onClick={() => fireEvent("conversion_complete", () => trackConversionComplete())}
              className="bg-[#22c55e] text-white text-sm px-4 py-2 rounded hover:bg-green-400 transition-colors"
            >
              Conversion Complete
            </button>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-[#1a1d27] border border-[#2e3347] rounded-lg p-6">
          <h2 className="font-heading text-xl text-white tracking-wide mb-4">Event Log</h2>
          {events.length === 0 ? (
            <p className="text-gray-600 text-sm">No events fired yet. Click a button above.</p>
          ) : (
            <ul className="space-y-1 font-mono text-sm">
              {events.map((event, i) => (
                <li key={i} className="text-green-400">
                  {event}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 border border-[#2e3347] rounded-lg">
          <h2 className="font-heading text-xl text-white tracking-wide mb-4">How To Verify</h2>
          <ol className="space-y-3 text-gray-400 text-sm list-decimal list-inside">
            <li>
              <strong className="text-white">GTM Debug Mode:</strong> Go to{" "}
              <span className="text-[#7E57C2]">tagassistant.google.com</span>, connect to your site, then click buttons above — events should appear in the Tag Assistant stream.
            </li>
            <li>
              <strong className="text-white">GA4 Real-Time:</strong> Open GA4 → Reports → Realtime → you should see yourself as an active user.
            </li>
            <li>
              <strong className="text-white">Meta Pixel Helper:</strong> Install the Chrome extension → visit any page → should show PageView. Click Book Now → should show Lead.
            </li>
            <li>
              <strong className="text-white">Google Ads:</strong> Conversions → your booking conversion should show &quot;Recording&quot; within 24-48hrs.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
