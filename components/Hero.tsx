"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import TrackedBookingLink from "./TrackedBookingLink";
import type { BookingLocation, BookingTier } from "@/lib/tracking";

interface HeroProps {
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  body?: string;
  primaryHref?: string;
  primaryLabel?: string;
  primaryLocation?: BookingLocation;
  primaryTier?: BookingTier;
  secondaryHref?: string;
  secondaryLabel?: string;
}

const DEFAULTS = {
  eyebrow: "OBSIDIAN VOLLEYBALL",
  titleLine1: "Sydney’s Junior",
  titleLine2: "Volleyball Specialists",
  body:
    "Junior Volleyball Training in Sydney.\nWeekly Training and Holiday Camps.\nAges 8 to 18, all levels welcome.",
  primaryHref: "/holiday-camp",
  primaryLabel: "HOLIDAY CAMPS",
  primaryLocation: "hero" as BookingLocation,
  primaryTier: "general" as BookingTier,
  secondaryHref: "/term-programs",
  secondaryLabel: "WEEKLY TRAINING",
};

export default function Hero({
  eyebrow = DEFAULTS.eyebrow,
  titleLine1 = DEFAULTS.titleLine1,
  titleLine2 = DEFAULTS.titleLine2,
  body = DEFAULTS.body,
  primaryHref = DEFAULTS.primaryHref,
  primaryLabel = DEFAULTS.primaryLabel,
  primaryLocation = DEFAULTS.primaryLocation,
  primaryTier = DEFAULTS.primaryTier,
  secondaryHref = DEFAULTS.secondaryHref,
  secondaryLabel = DEFAULTS.secondaryLabel,
}: HeroProps = {}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Obsidian Volleyball Academy training session"
          fill
          priority
          className="object-cover opacity-75 object-[50%_30%] sm:object-[75%_center]"
          sizes="100vw"
          quality={90}
        />

        {/* Radial glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh]"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(94,53,168,0.08) 0%, rgba(94,53,168,0.03) 30%, transparent 60%)",
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Diagonal accent lines */}
        <div
          className="absolute top-0 right-0 w-[1px] h-full origin-top-right"
          style={{
            background: "linear-gradient(180deg, transparent 10%, rgba(94,53,168,0.2) 40%, rgba(94,53,168,0.2) 60%, transparent 90%)",
            transform: "rotate(-20deg) translateX(30vw)",
          }}
        />

        {/* Gradient overlay focused on the LEFT half so text stays legible
            while the right half (where the spiking player sits) breathes. */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 via-40% to-transparent to-65%" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <p className="text-[#7E57C2] font-heading text-base sm:text-lg tracking-[0.4em] mb-6">
              {eyebrow}
            </p>
          </motion.div>

          <motion.h1
            className="font-heading text-[clamp(2.75rem,8.5vw,6.5rem)] leading-[0.95] text-white tracking-wide mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            {titleLine1}
            <br />
            <span className="text-[#7E57C2]">{titleLine2}</span>
          </motion.h1>

          <motion.div
            className="max-w-lg mb-10 space-y-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {body.split("\n").map((line, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-white text-xl sm:text-2xl font-heading tracking-wide leading-snug"
                    : "text-gray-400 text-base sm:text-lg leading-relaxed"
                }
              >
                {line}
              </p>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TrackedBookingLink
              location={primaryLocation}
              tier={primaryTier}
              href={primaryHref}
              className="bg-[#5E35A8] text-white font-heading text-2xl px-10 py-4 hover:bg-[#7E57C2] transition-all duration-300 tracking-wide text-center glow-purple"
            >
              {primaryLabel}
            </TrackedBookingLink>
            <Link
              href={secondaryHref}
              className="border border-white/20 text-white font-heading text-2xl px-10 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide text-center"
            >
              {secondaryLabel}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="text-gray-600 text-[10px] tracking-[0.3em] font-heading">SCROLL</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-[#7E57C2]/50 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
