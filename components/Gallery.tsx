"use client";

import { motion } from "framer-motion";

const galleryItems = [
  { label: "Training session", span: "col-span-2 row-span-2", aspect: "aspect-square" },
  { label: "Camp group photo", span: "col-span-1 row-span-1", aspect: "aspect-[4/3]" },
  { label: "Action shot", span: "col-span-1 row-span-1", aspect: "aspect-[4/3]" },
  { label: "Coaching drill", span: "col-span-1 row-span-2", aspect: "aspect-[3/5]" },
  { label: "Holiday camp", span: "col-span-1 row-span-1", aspect: "aspect-[4/3]" },
  { label: "Team celebration", span: "col-span-1 row-span-1", aspect: "aspect-[4/3]" },
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
            <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">IN ACTION</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">GALLERY</h2>
          </div>
          <a
            href="https://instagram.com/obsidianvolleyball"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-[#00FF88] text-sm transition-colors duration-300"
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
              className={`${item.span} photo-placeholder group relative overflow-hidden cursor-pointer`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-700 text-xs tracking-wider uppercase">{item.label}</span>
              </div>
              {/* Hover effect */}
              <div className="absolute inset-0 bg-[#00FF88]/0 group-hover:bg-[#00FF88]/[0.04] transition-all duration-500" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00FF88] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
