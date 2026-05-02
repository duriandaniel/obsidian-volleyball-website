"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Slot = { time: string; levels: Level[] };

export type Venue = {
  id: string;
  name: string;
  suburb: string;
  day: string;
  coaches: { name: string; slug: string }[];
  slots: Slot[];
};

export type LevelInfo = {
  level: Level;
  description: string;
  image: string;
};

interface LevelPickerProps {
  levels: LevelInfo[];
  venues: Venue[];
  enrolHref: string;
}

export default function LevelPicker({ levels, venues, enrolHref }: LevelPickerProps) {
  const [selected, setSelected] = useState<Level | null>(null);

  const optionsByVenue = selected
    ? venues
        .map((v) => ({
          venue: v,
          times: v.slots
            .filter((s) => s.levels.includes(selected))
            .map((s) => s.time),
        }))
        .filter((o) => o.times.length > 0)
    : [];

  return (
    <div>
      {/* Level cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {levels.map((info) => {
          const isActive = info.level === selected;
          const isDimmed = selected !== null && !isActive;
          return (
            <button
              key={info.level}
              onClick={() => setSelected(info.level)}
              className={`group relative text-left transition-all duration-500 overflow-hidden ${
                isDimmed ? "opacity-55 hover:opacity-100" : "opacity-100"
              }`}
            >
              {/* Image header */}
              <div
                className={`aspect-[4/3] relative overflow-hidden border ${
                  isActive ? "border-[#9B4FDE]" : "border-white/[0.06]"
                }`}
              >
                <Image
                  src={info.image}
                  alt={`${info.level} junior volleyball training`}
                  fill
                  className={`object-cover transition-transform duration-700 ${
                    isActive ? "scale-105" : "group-hover:scale-105"
                  }`}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  quality={85}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
                <div
                  className={`absolute inset-0 transition-colors duration-500 ${
                    isActive ? "bg-[#9B4FDE]/[0.06]" : "group-hover:bg-[#9B4FDE]/[0.04]"
                  }`}
                />
                {/* Level chip floating on image */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-block text-[11px] font-heading tracking-[0.3em] px-3 py-1.5 uppercase border transition-colors duration-300 ${
                      isActive
                        ? "bg-[#9B4FDE] text-white border-[#9B4FDE]"
                        : "bg-[#0A0A0A]/70 text-[#9B4FDE] border-[#9B4FDE]/30"
                    }`}
                  >
                    {info.level}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div
                className={`p-6 lg:p-8 border border-t-0 transition-colors duration-500 ${
                  isActive
                    ? "border-[#9B4FDE] bg-[#161020]"
                    : "border-white/[0.06] bg-[#0F0F0F] group-hover:bg-[#141114] group-hover:border-[#9B4FDE]/30"
                }`}
              >
                <p className="text-gray-400 text-sm leading-relaxed mb-6 min-h-[68px]">
                  {info.description}
                </p>
                <span
                  className={`inline-flex items-center gap-2 font-heading text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                    isActive
                      ? "text-[#9B4FDE]"
                      : "text-gray-400 group-hover:text-[#9B4FDE]"
                  }`}
                >
                  <span>{isActive ? "Showing classes" : "View classes"}</span>
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
              </div>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {!selected && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-600 text-sm tracking-wider mt-12"
        >
          Pick a level to see times and locations.
        </motion.p>
      )}

      {/* Reveal */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-20"
          >
            <ClassesList
              level={selected}
              optionsByVenue={optionsByVenue}
              enrolHref={enrolHref}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClassesList({
  level,
  optionsByVenue,
  enrolHref,
}: {
  level: Level;
  optionsByVenue: { venue: Venue; times: string[] }[];
  enrolHref: string;
}) {
  return (
    <div>
      <div className="mb-12">
        <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
          STEP 2
        </p>
        <h3 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95]">
          AVAILABLE
          <br />
          <span className="text-[#9B4FDE]">{level.toUpperCase()} CLASSES</span>
        </h3>
      </div>

      <div className="space-y-14">
        {optionsByVenue.map(({ venue, times }, i) => (
          <motion.div
            key={venue.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + i * 0.08, ease: "easeOut" }}
          >
            <VenueGroup venue={venue} times={times} enrolHref={enrolHref} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function VenueGroup({
  venue,
  times,
  enrolHref,
}: {
  venue: Venue;
  times: string[];
  enrolHref: string;
}) {
  return (
    <div>
      {/* Venue header — venue name primary, suburb secondary */}
      <div className="border-l-2 border-[#9B4FDE] pl-6 lg:pl-8 mb-6">
        <h4 className="font-heading text-3xl lg:text-5xl text-white tracking-wide leading-[0.95] mb-3">
          {venue.name.toUpperCase()}
        </h4>
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-3">
          {venue.suburb} &middot; {venue.day}
        </p>
        <p className="text-gray-500 text-sm">
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
        </p>
      </div>

      {/* Time rows */}
      <div className="space-y-px bg-white/[0.04] border border-white/[0.04]">
        {times.map((time) => (
          <div
            key={time}
            className="bg-[#0A0A0A] flex items-center justify-between gap-6 px-6 lg:px-8 py-5 lg:py-6 hover:bg-[#111] transition-colors duration-300"
          >
            <div className="flex items-center gap-6">
              <p className="font-heading text-xl lg:text-2xl text-[#9B4FDE] tracking-wider">
                {time}
              </p>
              <p className="text-gray-700 text-[10px] tracking-wider hidden sm:block">
                1.5 HR
              </p>
            </div>
            <Link
              href={enrolHref}
              className="inline-flex items-center gap-2 text-[#9B4FDE] font-heading text-sm tracking-[0.2em] hover:gap-3 transition-all duration-300 uppercase"
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
        ))}
      </div>
    </div>
  );
}
