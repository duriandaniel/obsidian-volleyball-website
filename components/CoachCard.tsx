"use client";

import { motion } from "framer-motion";

interface CoachCardProps {
  name: string;
  role: string;
  bio: string;
  qualifications: string[];
  index?: number;
}

export default function CoachCard({
  name,
  role,
  bio,
  qualifications,
  index = 0,
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
      <div className="aspect-[3/4] photo-placeholder relative mb-6 overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center">
            <span className="text-[#00FF88] font-heading text-4xl">{name[0]}</span>
          </div>
          <span className="text-gray-600 text-xs tracking-wider">PHOTO COMING SOON</span>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#00FF88]/0 group-hover:bg-[#00FF88]/[0.03] transition-all duration-500" />
      </div>

      {/* Info */}
      <div>
        <h3 className="font-heading text-4xl text-white tracking-wide mb-1">{name}</h3>
        <p className="text-[#00FF88] text-sm font-medium tracking-wider mb-4 uppercase">{role}</p>

        <p className="text-gray-400 text-sm leading-relaxed mb-6">{bio}</p>

        <div className="border-t border-white/[0.06] pt-4">
          <ul className="space-y-2">
            {qualifications.map((q, i) => (
              <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                <span className="text-[#00FF88] text-xs mt-0.5 flex-shrink-0">&#10003;</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
