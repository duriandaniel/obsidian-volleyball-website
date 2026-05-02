"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type Level = "Beginner" | "Intermediate" | "Advanced";

type Slot = { time: string; levels: Level[] };

export type Venue = {
  id: string;
  suburb: string;
  name: string;
  day: string;
  coaches: { name: string; slug: string }[];
  slots: Slot[];
};

interface VenuePickerProps {
  venues: Venue[];
  enrolHref: string;
}

export default function VenuePicker({ venues, enrolHref }: VenuePickerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = venues.find((v) => v.id === selectedId) ?? null;

  return (
    <div>
      {/* Tabs / location cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {venues.map((venue) => {
          const isActive = venue.id === selectedId;
          const isDimmed = selectedId !== null && !isActive;
          return (
            <button
              key={venue.id}
              onClick={() => setSelectedId(venue.id)}
              className={`group relative text-left p-8 lg:p-10 border transition-all duration-500 overflow-hidden ${
                isActive
                  ? "border-[#9B4FDE] bg-[#161020]"
                  : "border-white/[0.08] bg-[#0F0F0F] hover:border-[#9B4FDE]/40 hover:bg-[#141114]"
              } ${isDimmed ? "opacity-50 hover:opacity-90" : ""}`}
            >
              {/* Glow when active */}
              {isActive && (
                <motion.div
                  layoutId="venue-glow"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse at top left, rgba(155,79,222,0.10) 0%, transparent 60%)",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )}

              <div className="relative">
                <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.4em] mb-4 uppercase">
                  {venue.day}
                </p>
                <h3 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-3 leading-[0.95]">
                  {venue.suburb}
                </h3>
                <p className="text-gray-500 text-sm mb-8">{venue.name}</p>

                <span
                  className={`inline-flex items-center gap-2 font-heading text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                    isActive
                      ? "text-[#9B4FDE]"
                      : "text-gray-400 group-hover:text-[#9B4FDE]"
                  }`}
                >
                  <span>{isActive ? "Showing schedule" : "View schedule"}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`transition-transform duration-300 ${
                      isActive ? "translate-y-0.5 rotate-90" : "group-hover:translate-x-1"
                    }`}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state hint */}
      {!selected && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-600 text-sm tracking-wider mt-12"
        >
          Pick a location to see times.
        </motion.p>
      )}

      {/* Animated schedule reveal */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-16"
          >
            <VenueSchedule venue={selected} enrolHref={enrolHref} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VenueSchedule({ venue, enrolHref }: { venue: Venue; enrolHref: string }) {
  return (
    <div>
      {/* Coaches strip */}
      <div className="border-l-2 border-[#9B4FDE] pl-6 mb-10">
        <p className="text-gray-500 text-sm leading-relaxed">
          Coached by{" "}
          {venue.coaches.map((c, i) => (
            <span key={c.slug}>
              <Link
                href={`/coaches#${c.slug}`}
                className="text-white hover:text-[#9B4FDE] transition-colors underline decoration-white/20 underline-offset-4 hover:decoration-[#9B4FDE]"
              >
                {c.name}
              </Link>
              {i < venue.coaches.length - 1 ? " and " : ""}
            </span>
          ))}
          . Two courts run in parallel each session.
        </p>
      </div>

      {/* Slots */}
      <div className="space-y-px bg-white/[0.04]">
        {venue.slots.map((slot, i) => (
          <motion.div
            key={slot.time}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.06, ease: "easeOut" }}
          >
            <SlotRow slot={slot} enrolHref={enrolHref} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlotRow({ slot, enrolHref }: { slot: Slot; enrolHref: string }) {
  return (
    <div className="bg-[#0A0A0A] grid grid-cols-1 md:grid-cols-[180px_1fr] gap-px">
      <div className="bg-[#0F0F0F] flex items-center px-6 py-6 md:py-0">
        <p className="font-heading text-xl lg:text-2xl text-[#9B4FDE] tracking-wider">
          {slot.time}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.04]">
        {slot.levels.map((level, i) => (
          <CourtCard key={`${level}-${i}`} level={level} enrolHref={enrolHref} />
        ))}
      </div>
    </div>
  );
}

function CourtCard({ level, enrolHref }: { level: Level; enrolHref: string }) {
  const isAdvanced = level === "Advanced";
  return (
    <div
      className={`bg-[#0A0A0A] p-6 lg:p-8 group hover:bg-[#111] transition-colors duration-500 flex items-center justify-between gap-6 ${
        isAdvanced ? "ring-1 ring-inset ring-[#9B4FDE]/20" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="text-[#9B4FDE] text-[11px] font-heading tracking-[0.3em] border border-[#9B4FDE]/20 px-3 py-1 uppercase">
          {level}
        </span>
        <span className="text-gray-700 text-[10px] tracking-wider hidden sm:inline">
          1.5 HR
        </span>
      </div>
      <Link
        href={enrolHref}
        className="inline-flex items-center gap-2 text-[#9B4FDE] font-heading text-sm tracking-[0.2em] group-hover:gap-3 transition-all duration-300 uppercase"
      >
        <span>Enrol</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
