"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left";
}

export default function SectionReveal({ children, delay = 0, direction = "up" }: SectionRevealProps) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: direction === "up" ? 24 : 0,
        x: direction === "left" ? -24 : 0,
      }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
