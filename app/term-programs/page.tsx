import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Term Programs | Obsidian Volleyball Academy",
  description:
    "Weekly volleyball term programs at Obsidian Volleyball Academy. Term 2 details coming soon.",
};

export default function TermProgramsPage() {
  return (
    <div className="pt-20">
      <section className="min-h-[70vh] flex items-center bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">WEEKLY TRAINING</p>
            <h1 className="font-heading text-6xl sm:text-8xl text-white tracking-wide mb-8 leading-[0.9]">
              TERM
              <br />
              <span className="text-[#9B4FDE]">PROGRAMS</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              We&apos;re still working out the details for Term 2. Check back later for locations, times, and registration.
            </p>
            <Link
              href="/contact"
              className="inline-block border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide"
            >
              CONTACT US
            </Link>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
