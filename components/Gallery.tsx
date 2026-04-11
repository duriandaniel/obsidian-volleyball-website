"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const galleryItems = [
  { src: "/images/gallery-spike.jpg", label: "Spike at the net", span: "col-span-2 row-span-2" },
  { src: "/images/gallery-setting.jpg", label: "Setting drill", span: "col-span-1 row-span-1" },
  { src: "/images/gallery-serve.jpg", label: "Serve practice", span: "col-span-1 row-span-1" },
  { src: "/images/gallery-coaching.jpg", label: "Coaching session", span: "col-span-1 row-span-2" },
  { src: "/images/gallery-attack.jpg", label: "Attack at net", span: "col-span-1 row-span-1" },
  { src: "/images/gallery-game.jpg", label: "Game play", span: "col-span-1 row-span-1" },
];

export default function Gallery() {
  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">IN ACTION</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">GALLERY</h2>
          </div>
          <a
            href="https://instagram.com/obsidianvolleyball"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-[#9B4FDE] text-sm transition-colors duration-300"
          >
            <span>Follow @obsidianvolleyball</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </motion.div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[180px] md:auto-rows-[200px]">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`${item.span} relative overflow-hidden cursor-pointer group`}
            >
              <Image
                src={item.src}
                alt={item.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 25vw"
                quality={80}
              />
              {/* Hover effects */}
              <div className="absolute inset-0 bg-[#7B2FBE]/0 group-hover:bg-[#7B2FBE]/10 transition-all duration-500 z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#9B4FDE] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
