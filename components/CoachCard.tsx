"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface CoachCardProps {
  name: string;
  role: string;
  bio: string;
  qualifications: string[];
  index?: number;
  image?: string;
}

export default function CoachCard({
  name,
  role,
  bio,
  qualifications,
  index = 0,
  image,
}: CoachCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
      className="group"
    >
      {/* Photo area */}
      <div className="aspect-[3/4] relative mb-6 overflow-hidden bg-[#111]">
        {image ? (
          <Image
            src={image}
            alt={`Coach ${name}`}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
          />
        ) : (
          <div className="photo-placeholder absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center">
              <span className="text-[#9B4FDE] font-heading text-4xl">{name[0]}</span>
            </div>
            <span className="text-gray-600 text-xs tracking-wider">PHOTO COMING SOON</span>
          </div>
        )}
        <div className="absolute inset-0 bg-[#9B4FDE]/0 group-hover:bg-[#9B4FDE]/[0.03] transition-all duration-500" />
      </div>

      {/* Info */}
      <div>
        <h3 className="font-heading text-4xl text-white tracking-wide mb-1">{name}</h3>
        <p className="text-[#9B4FDE] text-sm font-medium tracking-wider mb-4 uppercase">{role}</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-6">{bio}</p>
        <div className="border-t border-white/[0.06] pt-4">
          <ul className="space-y-2">
            {qualifications.map((q, i) => (
              <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                <span className="text-[#9B4FDE] text-xs mt-0.5 flex-shrink-0">&#10003;</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
