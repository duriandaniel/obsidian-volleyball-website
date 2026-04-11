"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const INSTAGRAM_HANDLE = "obsidianvolleyball";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

// Use real training photos as Instagram preview tiles
const previewImages = [
  { src: "/images/gallery-spike.jpg", alt: "Spike at the net" },
  { src: "/images/jersey-detail.jpg", alt: "OVA jersey detail" },
  { src: "/images/gallery-attack.jpg", alt: "Attack drill" },
  { src: "/images/gallery-coaching.jpg", alt: "Coaching session" },
  { src: "/images/gallery-girls.jpg", alt: "Players at the net" },
  { src: "/images/gallery-action2.jpg", alt: "Setting the ball" },
  { src: "/images/coach-instruction.jpg", alt: "Coach instruction" },
  { src: "/images/venue.jpg", alt: "Baulkham Hills High School venue" },
];

export default function InstagramFeed() {
  return (
    <section className="py-24 lg:py-32 bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">FOLLOW US</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">
              @{INSTAGRAM_HANDLE.toUpperCase()}
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#9B4FDE] font-heading text-base tracking-wide hover:text-white transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            FOLLOW ON INSTAGRAM
          </a>
        </motion.div>

        {/* Grid of images linking to Instagram */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-2 group"
        >
          {previewImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="aspect-square relative overflow-hidden"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:brightness-75 transition-all duration-500"
                sizes="(max-width: 768px) 25vw, 12.5vw"
                quality={70}
              />
              <div className="absolute inset-0 bg-[#7B2FBE]/0 group-hover:bg-[#7B2FBE]/10 transition-all duration-500" />
            </motion.div>
          ))}
        </a>
      </div>
    </section>
  );
}
