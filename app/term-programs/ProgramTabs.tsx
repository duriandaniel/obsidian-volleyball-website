"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LevelPicker, { type Venue, type LevelInfo } from "./LevelPicker";

type TabId = "juniors" | "adults";

interface ProgramTabsProps {
  venues: Venue[];
  levels: LevelInfo[];
  enrolHref: string;
}

export default function ProgramTabs({ venues, levels, enrolHref }: ProgramTabsProps) {
  const [tab, setTab] = useState<TabId>("juniors");

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex flex-wrap gap-3 sm:gap-4 mb-12 lg:mb-16" role="tablist">
        <TabButton active={tab === "juniors"} onClick={() => setTab("juniors")}>
          Junior Classes
        </TabButton>
        <TabButton active={tab === "adults"} onClick={() => setTab("adults")}>
          Adult Sessions
        </TabButton>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === "juniors" && (
          <motion.div
            key="juniors"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-10">
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95]">
                JUNIOR
                <br />
                <span className="text-[#9B4FDE]">CLASSES</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
                Two two-hour sessions every Friday for ages 8 to 18. Pick the level
                that fits and we&apos;ll show the available class.
              </p>
            </div>
            <LevelPicker
              levels={levels}
              venues={venues}
              enrolHref={enrolHref}
            />
          </motion.div>
        )}

        {tab === "adults" && (
          <motion.div
            key="adults"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <AdultSessions enrolHref={enrolHref} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`font-heading text-base sm:text-lg lg:text-xl tracking-[0.2em] uppercase px-6 sm:px-8 py-3 sm:py-3.5 transition-all duration-300 border ${
        active
          ? "bg-[#7B2FBE] text-white border-[#7B2FBE] glow-purple"
          : "bg-transparent text-gray-400 border-white/[0.12] hover:text-white hover:border-[#9B4FDE]/40"
      }`}
    >
      {children}
    </button>
  );
}

function AdultSessions({ enrolHref }: { enrolHref: string }) {
  return (
    <div>
      <div className="mb-10">
        <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide leading-[0.95]">
          ADULT
          <br />
          <span className="text-[#9B4FDE]">SCRIMS</span>
        </h2>
        <p className="text-gray-500 text-sm sm:text-base max-w-2xl mt-4 leading-relaxed">
          Casual scrimmage volleyball for adults at Bennelong Sports Centre. Both
          courts running, open to all skill levels.
        </p>
      </div>

      {/* Single big card */}
      <div className="border border-white/[0.06] bg-[#0F0F0F] hover:border-[#9B4FDE]/40 transition-colors duration-500">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-px bg-white/[0.04]">
          {/* Left: details */}
          <div className="bg-[#0F0F0F] p-8 lg:p-12">
            <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.4em] uppercase mb-4">
              Bennelong Sports Centre &middot; West Ryde
            </p>

            <div className="flex items-baseline gap-3 sm:gap-5 mb-8 flex-wrap">
              <span className="font-heading text-xl sm:text-2xl lg:text-3xl text-white tracking-[0.2em] uppercase">
                Friday
              </span>
              <span className="hidden sm:inline-block w-px h-7 bg-[#9B4FDE]/40" />
              <span className="font-heading text-xl sm:text-2xl lg:text-3xl text-[#9B4FDE] tracking-wider">
                8:00 &ndash; 10:00 PM
              </span>
            </div>

            <ul className="space-y-3 mb-10 text-gray-300 text-sm lg:text-base">
              <li className="flex items-start gap-3">
                <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                <span>Two indoor courts running in parallel.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                <span>Open to adults at any skill level.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                <span>Casual scrimmage format. Show up, get on court, play.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#9B4FDE] flex-shrink-0 mt-0.5">+</span>
                <span>Two-hour block, weekly during school terms.</span>
              </li>
            </ul>

            <Link
              href={enrolHref}
              className="inline-flex items-center gap-2 bg-[#7B2FBE] text-white font-heading text-sm tracking-[0.2em] uppercase px-7 py-3 hover:bg-white hover:text-[#7B2FBE] transition-all duration-300 glow-purple"
            >
              <span>Book a Spot</span>
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

          {/* Right: details panel */}
          <div className="bg-[#0A0A0A] p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <p className="text-gray-600 font-heading text-xs tracking-[0.3em] uppercase mb-3">
                What to expect
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Adult scrims are a chill way to get court time, meet other Sydney
                players, and stay sharp. Skill is mixed; teams are balanced on the
                night.
              </p>

              <p className="text-gray-600 font-heading text-xs tracking-[0.3em] uppercase mb-3">
                What to bring
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Indoor court shoes (clean, non-marking), water, a friend if you have
                one. Knee pads optional.
              </p>
            </div>

            <p className="text-gray-700 text-[10px] tracking-wider mt-8">
              SAME VENUE AS JUNIOR CLASSES
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
