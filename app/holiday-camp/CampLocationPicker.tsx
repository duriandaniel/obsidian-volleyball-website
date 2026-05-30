"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";

type LocationId = "baulkham" | "tba";

interface LocationOption {
  id: LocationId;
  label: string;
  sub: string;
  available: boolean;
}

const LOCATIONS: LocationOption[] = [
  {
    id: "baulkham",
    label: "Baulkham Hills",
    sub: "Sydney",
    available: true,
  },
  {
    id: "tba",
    label: "More venues coming",
    sub: "TBA across Sydney",
    available: false,
  },
];

const LEVELS = [
  {
    level: "BEGINNER",
    points: [
      "No prior experience needed",
      "Learn the basics: passing, setting, serving",
      "Friendly, low-pressure environment",
      "Build confidence with the ball",
    ],
  },
  {
    level: "INTERMEDIATE",
    points: [
      "Refine fundamentals and consistency",
      "Spiking, blocking, and rotations",
      "Court awareness and positioning",
      "Game play in modified formats",
    ],
  },
  {
    level: "ADVANCED",
    points: [
      "Higher tempo, full-court game play",
      "Tactics, systems, and team play",
      "Skill polish: jump serve, attacking",
      "Suited to players with club or rep experience",
    ],
  },
];

const SCHEDULE = [
  { time: "9:00 AM", title: "Check-in", body: "Drop-off at the venue. Coaches greet players and direct them to the court." },
  { time: "9:15 AM", title: "Introduction & warm-up", body: "Group introduction, mobility, and dynamic warm-up." },
  { time: "9:30 AM", title: "Split into three courts", body: "Players move to their level (beginner, intermediate, advanced). Drills on passing and setting." },
  { time: "11:00 AM", title: "Break", body: "20-minute break. Snacks, water, rest." },
  { time: "11:20 AM", title: "Serving, spiking, game play", body: "Serving and attacking work, then game play. Cool-down at the end." },
  { time: "1:00 PM", title: "Dismissal", body: "Players collected from the venue." },
];

export default function CampLocationPicker() {
  const [selected, setSelected] = useState<LocationId | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);

  function handleSelect(id: LocationId) {
    setSelected(id);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  return (
    <>
      {/* Step 1 — Choose a location */}
      <section className="py-20 lg:py-24 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-10">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">STEP 1</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95]">
                CHOOSE A
                <br />
                <span className="text-[#9B4FDE]">LOCATION</span>
              </h2>
            </div>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {LOCATIONS.map((loc) => {
              const isActive = loc.id === selected;
              const isDimmed = selected !== null && !isActive;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc.id)}
                  className={`group relative text-left p-8 lg:p-10 border-2 transition-all duration-500 overflow-hidden ${
                    isActive
                      ? "border-[#9B4FDE] bg-[#161020]"
                      : "border-white/[0.08] bg-[#0F0F0F] hover:border-[#9B4FDE]/40 hover:bg-[#141114]"
                  } ${isDimmed ? "opacity-55 hover:opacity-90" : ""}`}
                >
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.4em] mb-4 uppercase">
                    {loc.sub}
                  </p>
                  <h3 className="font-heading text-3xl lg:text-5xl text-white tracking-wide mb-6 leading-[0.95]">
                    {loc.label.toUpperCase()}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-2 font-heading text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                      isActive ? "text-[#9B4FDE]" : "text-gray-400 group-hover:text-[#9B4FDE]"
                    }`}
                  >
                    <span>{isActive ? "Showing details" : loc.available ? "View camp details" : "View status"}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform duration-300 ${
                        isActive ? "rotate-90" : "group-hover:translate-x-1"
                      }`}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>

          {!selected && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-gray-600 text-sm tracking-wider mt-12"
            >
              Pick a location to see camp details and pricing.
            </motion.p>
          )}
        </div>
      </section>

      {/* Conditional content */}
      <div ref={revealRef} className="scroll-mt-32">
        <AnimatePresence mode="wait">
          {selected === "baulkham" && (
            <motion.div
              key="baulkham"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <BaulkhamContent />
            </motion.div>
          )}

          {selected === "tba" && (
            <motion.div
              key="tba"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <TbaContent />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function BaulkhamContent() {
  return (
    <>
      {/* Programs / Levels */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">CHOOSE YOUR LEVEL</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PROGRAMS</h2>
            </div>
          </SectionReveal>
          <p className="text-gray-500 text-sm max-w-2xl mb-10">
            Players are grouped by skill level, not age. Three courts, three levels — everyone trains at the right intensity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
            {LEVELS.map((tier) => (
              <div key={tier.level} className="bg-[#111] p-8 lg:p-10 group hover:bg-[#161616] transition-colors duration-500 h-full">
                <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-6">{tier.level}</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {tier.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="text-[#9B4FDE] flex-shrink-0">+</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Schedule */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">A DAY AT CAMP</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">DAILY SCHEDULE</h2>
            </div>
          </SectionReveal>
          <div className="space-y-0">
            {SCHEDULE.map((slot) => (
              <div key={slot.time} className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 py-5 border-b border-white/[0.06] group">
                <p className="font-heading text-base sm:text-lg text-[#9B4FDE] tracking-wider pt-1">{slot.time}</p>
                <div>
                  <p className="text-white text-base sm:text-lg font-medium mb-1 group-hover:text-[#9B4FDE] transition-colors duration-300">{slot.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{slot.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">BAULKHAM HILLS &middot; INVESTMENT</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PRICING</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Single Day */}
            <div className="border border-white/[0.06] p-8 lg:p-10 hover:border-[#9B4FDE]/20 transition-all duration-500">
              <p className="text-gray-600 font-heading text-xs tracking-[0.3em] mb-6">FLEXIBLE</p>
              <p className="font-heading text-5xl text-white mb-2">$50</p>
              <p className="text-gray-600 text-sm mb-6">Per day</p>
              <ul className="space-y-3 text-gray-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> Single day attendance</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> 9 AM &ndash; 1 PM</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> No commitment required</li>
              </ul>
              <TrackedBookingLink
                href="/booking/camps"
                tier="single_day"
                location="pricing_single"
                className="block border border-white/20 text-white font-heading text-lg px-6 py-3 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
              >
                BOOK A DAY
              </TrackedBookingLink>
            </div>

            {/* 5-Day Package */}
            <div className="border-2 border-[#9B4FDE]/40 p-8 lg:p-12 hover:border-[#9B4FDE] transition-all duration-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#7B2FBE] text-white font-heading text-xs tracking-[0.2em] px-4 py-1.5">BEST VALUE</span>
              </div>
              <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-6 mt-2">5-DAY PACKAGE</p>
              <p className="font-heading text-7xl text-white mb-2">$200</p>
              <p className="text-gray-600 text-sm mb-6">All 5 days + free shirt</p>
              <ul className="space-y-3 text-gray-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> All 5 days of camp</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> Free Obsidian training jersey included</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> 9 AM &ndash; 1 PM daily</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> Save $50 vs single days</li>
              </ul>
              <TrackedBookingLink
                href="/booking/camps"
                tier="5_day_pack"
                location="pricing_package"
                className="block bg-[#7B2FBE] text-white font-heading text-lg px-6 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
              >
                BOOK 5-DAY PACK
              </TrackedBookingLink>
            </div>

            {/* Half Day */}
            <div className="border border-white/[0.06] p-8 lg:p-10 hover:border-[#9B4FDE]/20 transition-all duration-500">
              <p className="text-gray-600 font-heading text-xs tracking-[0.3em] mb-6">HALF DAY</p>
              <p className="font-heading text-5xl text-white mb-2">$35</p>
              <p className="text-gray-600 text-sm mb-6">Half-day session</p>
              <ul className="space-y-3 text-gray-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> Morning session</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> 9 AM &ndash; 11 AM</li>
                <li className="flex items-center gap-2"><span className="text-[#9B4FDE]">+</span> 2 hours of coaching</li>
              </ul>
              <TrackedBookingLink
                href="/booking/camps"
                tier="half_day"
                location="pricing_half"
                className="block border border-white/20 text-white font-heading text-lg px-6 py-3 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
              >
                BOOK HALF DAY
              </TrackedBookingLink>
            </div>
          </div>
          <p className="text-gray-700 text-xs mt-8 tracking-wider">PRICING SHOWN IS FOR THE BAULKHAM HILLS VENUE.</p>
        </div>
      </section>

      {/* What to Bring + Venue */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">PREPARE</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-10">WHAT TO BRING</h2>
              <ul className="space-y-4">
                {[
                  "Shoes suitable for volleyball",
                  "Water bottle",
                  "Lunch and snacks for full-day camps",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-400">
                    <span className="text-[#9B4FDE] font-heading text-lg flex-shrink-0 w-6">{i + 1}</span>
                    <span className="text-sm leading-relaxed pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">LOCATION</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-8">VENUE</h2>
              <div className="mb-6">
                <address className="not-italic space-y-2">
                  <p className="text-white text-lg">Baulkham Hills High School</p>
                  <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills</p>
                  <p className="text-gray-500 text-sm">NSW 2153, Sydney</p>
                </address>
                <p className="text-gray-600 text-sm mt-4 leading-relaxed">
                  Free parking on-site. Central to Castle Hill, Kellyville, Cherrybrook, and Bella Vista.
                </p>
              </div>
              <a
                href="https://www.google.com/maps/place/Obsidian+Volleyball+Academy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors"
              >
                Get directions
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A] text-center relative overflow-hidden">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh]"
          style={{ background: "radial-gradient(ellipse at center, rgba(123,47,190,0.03) 0%, transparent 60%)" }}
        />
        <div className="relative max-w-2xl mx-auto px-4">
          <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">SPOTS ARE LIMITED</p>
          <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
            BOOK YOUR
            <br />
            <span className="text-[#9B4FDE]">PLACE</span>
          </h2>
          <p className="text-gray-500 mb-10 leading-relaxed">Holiday camps fill fast. Book early to guarantee a spot.</p>
          <TrackedBookingLink
            href="/booking/camps"
            location="camp_cta"
            className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
          >
            BOOK NOW
          </TrackedBookingLink>
          <p className="text-gray-700 text-xs mt-6 tracking-wider">BAULKHAM HILLS &middot; ALL SKILL LEVELS &middot; AGES 8&ndash;18</p>
        </div>
      </section>
    </>
  );
}

function TbaContent() {
  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-[#9B4FDE]/30 bg-[#0F0F0F] p-10 lg:p-14">
          <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-5">COMING SOON</p>
          <h3 className="font-heading text-3xl lg:text-5xl text-white tracking-wide mb-6 leading-[0.95]">
            New camp venues being added across Sydney.
          </h3>
          <p className="text-gray-400 text-base leading-relaxed mb-4">
            We&apos;re finalising additional holiday camp locations beyond Baulkham Hills.
            Pricing and dates per venue will be announced as each one is confirmed.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Want to be notified when bookings open at a specific suburb? Drop us a line and
            we&apos;ll save you a spot when the venue goes live.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center bg-[#7B2FBE] text-white font-heading text-lg px-8 py-3 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              GET NOTIFIED
            </Link>
            <a
              href="mailto:obsidianvolleyball@gmail.com"
              className="inline-flex items-center justify-center border border-white/20 text-white font-heading text-lg px-8 py-3 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide"
            >
              EMAIL US
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

