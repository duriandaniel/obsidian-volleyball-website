"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-4 sm:right-6 z-40"
        >
          <a
            href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#00FF88] text-black font-heading text-lg px-6 py-3 hover:bg-white transition-all duration-300 tracking-wide glow-green"
          >
            <span>BOOK NOW</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
