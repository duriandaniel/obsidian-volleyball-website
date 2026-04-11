"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Obsidian Volleyball Academy training session"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
          quality={85}
        />

        {/* Radial glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh]"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(123,47,190,0.08) 0%, rgba(123,47,190,0.03) 30%, transparent 60%)",
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
            background: "linear-gradient(180deg, transparent 10%, rgba(123,47,190,0.2) 40%, rgba(123,47,190,0.2) 60%, transparent 90%)",
            transform: "rotate(-20deg) translateX(30vw)",
          }}
        />

        {/* Gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p className="text-[#9B4FDE] font-heading text-base sm:text-lg tracking-[0.4em] mb-6">
                HILLS DISTRICT &middot; SYDNEY
              </p>
            </motion.div>

            <motion.h1
              className="font-heading text-[clamp(3.5rem,12vw,10rem)] leading-[0.9] text-white tracking-wide mb-8"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            >
              ELITE
              <br />
              JUNIOR
              <br />
              <span className="text-[#9B4FDE]">VOLLEY</span>BALL
            </motion.h1>

            <motion.p
              className="text-gray-400 text-lg sm:text-xl max-w-lg mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Volleyball NSW affiliated coaching in Baulkham Hills.
              Holiday camps & term programs — beginner to competitive.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a
                href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#7B2FBE] text-white font-heading text-2xl px-10 py-4 hover:bg-[#9B4FDE] transition-all duration-300 tracking-wide text-center glow-purple"
              >
                BOOK NOW
              </a>
              <a
                href="/holiday-camp"
                className="border border-white/20 text-white font-heading text-2xl px-10 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
              >
                VIEW CAMPS
              </a>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-row lg:flex-col gap-6 lg:gap-8 lg:pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {[
              { label: "Volleyball NSW", sub: "Affiliated" },
              { label: "Ages 8–18", sub: "All Levels" },
              { label: "Hills District", sub: "Baulkham Hills" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[#9B4FDE] rounded-full flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium leading-tight">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
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
          className="w-px h-8 bg-gradient-to-b from-[#9B4FDE]/50 to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
