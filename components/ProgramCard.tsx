"use client";

import { motion } from "framer-motion";

interface ProgramCardProps {
  title: string;
  level: string;
  description: string;
  ageRange: string;
  features: string[];
}

export default function ProgramCard({
  title,
  level,
  description,
  ageRange,
  features,
}: ProgramCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#111] border border-white/[0.06] hover:border-[#00FF88]/30 transition-all duration-500 group relative overflow-hidden"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-6 lg:p-8">
        {/* Level + Age */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[#00FF88] text-[11px] font-heading tracking-[0.3em] border border-[#00FF88]/20 px-3 py-1">
            {level}
          </span>
          <span className="text-gray-600 text-xs tracking-wider">AGES {ageRange}</span>
        </div>

        <h3 className="font-heading text-4xl text-white tracking-wide mb-4 group-hover:text-[#00FF88] transition-colors duration-300">
          {title}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-8">{description}</p>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
              <span className="text-[#00FF88] text-xs mt-1 flex-shrink-0">&#9642;</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <a
          href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#00FF88] font-heading text-lg tracking-wide group/btn hover:gap-3 transition-all duration-300"
        >
          <span>BOOK THIS PROGRAM</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
