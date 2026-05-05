"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export type Level = "Beginner" | "Intermediate" | "Advanced";

export type Slot = { time: string; levels: Level[] };

export type Coach = { name: string; slug: string; image?: string };

export type Venue = {
  id: string;
  name: string;
  suburb: string;
  day: string;
  coaches: Coach[];
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
  const revealRef = useRef<HTMLDivElement | null>(null);

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

  function handleSelect(level: Level) {
    setSelected(level);
    // Scroll the reveal area into view after the next paint so the user
    // (especially on mobile, where level cards are stacked) sees the
    // freshly rendered class options.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        revealRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  return (
    <div>
      {/* Level cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {levels.map((info) => {
          const isActive = info.level === selected;
          const isDimmed = selected !== null && !isActive;
          return (
            <button
              key={info.level}
              onClick={() => handleSelect(info.level)}
              className={`group relative text-left flex flex-col h-full transition-all duration-500 overflow-hidden ${
                isDimmed ? "opacity-55 hover:opacity-100" : "opacity-100"
              }`}
            >
              {/* Image */}
              <div
                className={`aspect-[4/3] relative overflow-hidden border-2 transition-colors duration-500 ${
                  isActive
                    ? "border-[#9B4FDE]"
                    : "border-white/[0.06] group-hover:border-[#9B4FDE]/40"
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 via-transparent to-transparent" />
                <div
                  className={`absolute inset-0 transition-colors duration-500 ${
                    isActive ? "bg-[#9B4FDE]/[0.08]" : "group-hover:bg-[#9B4FDE]/[0.04]"
                  }`}
                />
              </div>

              {/* Body */}
              <div
                className={`flex-1 flex flex-col p-7 lg:p-9 border-2 border-t-0 transition-colors duration-500 ${
                  isActive
                    ? "border-[#9B4FDE] bg-[#161020]"
                    : "border-white/[0.06] bg-[#0F0F0F] group-hover:bg-[#141114] group-hover:border-[#9B4FDE]/30"
                }`}
              >
                {/* Big level name */}
                <h3
                  className={`font-heading text-4xl lg:text-6xl tracking-wide leading-[0.95] mb-5 transition-colors duration-300 ${
                    isActive ? "text-[#9B4FDE]" : "text-white group-hover:text-[#9B4FDE]"
                  }`}
                >
                  {info.level.toUpperCase()}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm lg:text-base leading-relaxed flex-1 mb-7">
                  {info.description}
                </p>

                {/* CTA pinned to bottom */}
                <span
                  className={`inline-flex items-center gap-2 font-heading text-sm tracking-[0.25em] uppercase transition-colors duration-300 ${
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
      <div ref={revealRef} className="scroll-mt-32">
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
        <h3 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95]">
          {level.toUpperCase()}{" "}
          <span className="text-[#9B4FDE]">CLASSES</span>
        </h3>
      </div>

      <div className="space-y-16">
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
      {/* Venue header: name + suburb. Day moves to each slot row so future
          venues can host multiple days without contradicting a header label. */}
      <div className="border-l-2 border-[#9B4FDE] pl-5 sm:pl-6 lg:pl-8 mb-6 lg:mb-8">
        <h4 className="font-heading text-2xl sm:text-3xl lg:text-5xl text-white tracking-wide leading-[1.0]">
          {venue.name.toUpperCase()}
          <span className="block sm:inline text-gray-500 text-base sm:text-xl lg:text-2xl tracking-wider sm:ml-2">
            ({venue.suburb})
          </span>
        </h4>
      </div>

      {/* Time rows */}
      <div className="space-y-px bg-white/[0.04] border border-white/[0.04]">
        {times.map((time) => (
          <SlotRow
            key={time}
            day={venue.day}
            time={time}
            coaches={venue.coaches}
            enrolHref={enrolHref}
          />
        ))}
      </div>
    </div>
  );
}

function SmallCoachAvatar({ coach }: { coach: Coach }) {
  return (
    <Link
      href={`/coaches#${coach.slug}`}
      title={coach.name}
      aria-label={`Coach ${coach.name} profile`}
      className="block group/av"
    >
      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#0A0A0A] bg-[#0F0F0F] ring-1 ring-white/10 group-hover/av:ring-[#9B4FDE] transition-all duration-300">
        {coach.image ? (
          <Image
            src={coach.image}
            alt={coach.name}
            fill
            className="object-cover object-top"
            sizes="40px"
            quality={75}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1424] to-[#0F0F0F]">
            <span className="text-[#9B4FDE] font-heading text-sm">
              {coach.name[0]}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function SlotRow({
  day,
  time,
  coaches,
  enrolHref,
}: {
  day: string;
  time: string;
  coaches: Coach[];
  enrolHref: string;
}) {
  const coachNames = coaches.map((c) => c.name).join(" + ");
  return (
    <div className="bg-[#0A0A0A] hover:bg-[#111] transition-colors duration-300">
      {/* Mobile: stacked card layout */}
      <div className="flex flex-col gap-5 px-5 py-5 sm:hidden">
        {/* Top: day + time on the left, price on the right */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-baseline gap-2.5 flex-wrap min-w-0">
            <span className="font-heading text-sm text-white tracking-[0.25em] uppercase">
              {day}
            </span>
            <span className="font-heading text-base text-[#9B4FDE] tracking-wider">
              {time}
            </span>
          </div>
          <div className="flex items-baseline gap-2 leading-none shrink-0">
            <span className="text-gray-600 text-xs line-through">$360</span>
            <span className="font-heading text-lg text-[#9B4FDE]">$288</span>
          </div>
        </div>

        {/* Middle: coaches + duration */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 shrink-0">
            {coaches.map((c) => (
              <SmallCoachAvatar key={c.slug} coach={c} />
            ))}
          </div>
          <span className="text-gray-400 text-xs tracking-wide truncate">
            {coachNames}
          </span>
          <span className="text-gray-700 text-[10px] tracking-wider ml-auto shrink-0">
            2 HR
          </span>
        </div>

        {/* Bottom: full-width enrol button */}
        <Link
          href={enrolHref}
          className="flex items-center justify-center gap-2 bg-[#7B2FBE] text-white font-heading text-sm tracking-[0.25em] uppercase px-6 py-3.5 hover:bg-white hover:text-[#7B2FBE] active:bg-white active:text-[#7B2FBE] transition-all duration-300 glow-purple"
        >
          <span>Enrol</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Desktop: single-row layout */}
      <div className="hidden sm:flex sm:items-center justify-between gap-6 px-6 lg:px-8 py-5 lg:py-6">
        {/* Left: day + time + coaches + duration */}
        <div className="flex items-center gap-5 lg:gap-7 flex-wrap min-w-0">
          <div className="flex items-baseline gap-4 lg:gap-5 shrink-0">
            <span className="font-heading text-lg lg:text-2xl text-white tracking-[0.2em] uppercase">
              {day}
            </span>
            <span className="font-heading text-lg lg:text-2xl text-[#9B4FDE] tracking-wider">
              {time}
            </span>
          </div>
          <span className="inline-block w-px h-7 bg-white/10 shrink-0" />
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex -space-x-2">
              {coaches.map((c) => (
                <SmallCoachAvatar key={c.slug} coach={c} />
              ))}
            </div>
            <span className="text-gray-400 text-sm tracking-wide truncate">
              {coachNames}
            </span>
          </div>
          <span className="hidden md:inline-block text-gray-700 text-[10px] tracking-wider shrink-0">
            2 HR
          </span>
        </div>

        {/* Right: price + enrol */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-baseline gap-2 leading-none">
            <span className="text-gray-600 text-sm line-through">$360</span>
            <span className="font-heading text-xl text-[#9B4FDE]">$288</span>
          </div>
          <Link
            href={enrolHref}
            className="inline-flex items-center gap-2 bg-[#7B2FBE] text-white font-heading text-sm tracking-[0.2em] uppercase px-6 py-3 hover:bg-white hover:text-[#7B2FBE] transition-all duration-300 glow-purple"
          >
            <span>Enrol</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
