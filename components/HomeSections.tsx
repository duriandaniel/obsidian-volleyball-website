import Image from "next/image";
import Link from "next/link";
import CoachCard from "@/components/CoachCard";
import Gallery from "@/components/Gallery";
import ReelPlayer from "@/components/ReelPlayer";
import SectionReveal from "@/components/SectionReveal";

const FEATURED_REELS = [
  "Ethan_Beginner_Setting_Hand_Position_pdsrrv",
  "Ethan_Beginner_Blocking_No_Net_Touch_xhe6rp",
  "Ethan_Blocking_Tight_Hands_tivhlv",
];

const faqs = [
  {
    q: "Where do you run programs?",
    a: "Term programs at Bennelong Sports Centre, West Ryde, every Friday. Holiday camps at Baulkham Hills High School.",
  },
  {
    q: "What age groups do you cater for?",
    a: "Juniors aged 8 to 18, grouped by skill level not age.",
  },
  {
    q: "My child has never played. Is that OK?",
    a: "Yes. Our beginner programs are built for zero experience.",
  },
];

export default function HomeSections() {
  return (
    <>
      {/* On court — featured reels */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(123,47,190,0.10) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12 lg:mb-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">SEE OUR COACHING IN ACTION</p>
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white tracking-wide">
                  ON <span className="text-[#9B4FDE]">COURT</span>
                </h2>
              </div>
              <a
                href="https://instagram.com/obsidianvolleyball"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#9B4FDE] text-sm font-medium tracking-wide hover:text-white transition-colors"
              >
                More on Instagram
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-items-center">
            {FEATURED_REELS.map((id, i) => (
              <SectionReveal key={id} delay={i * 0.1}>
                <ReelPlayer publicId={id} />
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section id="about" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 lg:gap-24 items-center">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">OUR STORY</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
                  ABOUT
                  <br />
                  <span className="text-[#9B4FDE]">OBSIDIAN</span>
                </h2>
                <p className="text-gray-400 leading-relaxed">
                  Founded in 2025 to bring premium junior volleyball coaching to Sydney families.
                  Now launching term programs at Bennelong Sports Centre, West Ryde, with holiday
                  camps at Baulkham Hills High School.
                </p>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src="/images/about.jpg"
                  alt="Obsidian Volleyball Academy junior players in training"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <Gallery />

      {/* Coaches */}
      <section id="coaches" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">YOUR TEAM</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">COACHES</h2>
              </div>
              <Link
                href="/coaches"
                className="mt-4 lg:mt-0 text-gray-500 hover:text-[#9B4FDE] text-sm flex items-center gap-2 transition-colors"
              >
                Meet the full team
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            <CoachCard
              name="Chris"
              role="Coach"
              bio="Plays in Sydney's Men's Premier Volleyball League. Passes years of senior-level experience straight to the next generation."
              qualifications={["Men's Premier Volleyball League", "Sydney North Gold & MVP"]}
              image="/images/coach-chris-card.png"
              index={0}
            />
            <CoachCard
              name="Kaveesh"
              role="Coach"
              bio="Years of representative volleyball with a passion for coaching juniors. Energy and technical knowledge make sessions fun and effective."
              qualifications={["16s NSWCHS State Team", "2022 18s SVL Champions"]}
              image="/images/coach-kaveesh-card.jpg"
              index={1}
            />
            <CoachCard
              name="Melinda"
              role="Coach"
              bio="Years of competitive volleyball experience and a deep commitment to junior development."
              qualifications={["NSWCHS Opens Champion", "NSW & SW Blues Award"]}
              image="/images/coach-melinda-card.jpg"
              index={2}
            />
          </div>
        </div>
      </section>

      {/* Jerseys */}
      <section id="jerseys" className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="section-divider absolute left-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">GEAR UP</p>
                <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
                  OBSIDIAN
                  <br />
                  <span className="text-[#9B4FDE]">TRAINING JERSEY</span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  High-quality training jerseys, designed in collaboration with{" "}
                  <span className="text-white">Mt Sportswear HK</span>. Buy on-site, try
                  on different sizes, take one home the same day.
                </p>
                <div className="flex items-baseline gap-3 mb-8">
                  <p className="font-heading text-5xl text-[#9B4FDE]">$36</p>
                  <p className="text-gray-600 text-sm">per jersey</p>
                </div>
                <p className="text-gray-600 text-sm">
                  Available on-site. Multiple sizes available so you can try before you
                  buy.
                </p>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.2}>
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src="/images/jersey-detail.jpg"
                  alt="Obsidian Volleyball Academy jersey"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  quality={85}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Location */}
      <section id="location" className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="section-divider absolute left-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">FIND US</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">LOCATION</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
            <SectionReveal>
              <div className="space-y-8">
                {/* Bennelong Sports Centre - West Ryde (term programs) */}
                <div>
                  <p className="text-gray-500 text-[10px] font-heading tracking-[0.3em] uppercase mb-2">
                    Term programs &middot; West Ryde
                  </p>
                  <h3 className="font-heading text-2xl text-[#9B4FDE] mb-3 tracking-wide">BENNELONG SPORTS CENTRE</h3>
                  <address className="not-italic space-y-1 text-gray-300 text-sm">
                    <p className="text-white text-base">Bennelong Sports Centre</p>
                    <p>West Ryde, NSW</p>
                  </address>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Bennelong+Sports+Centre+West+Ryde"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#9B4FDE] text-xs font-medium hover:text-white transition-colors mt-3"
                  >
                    Directions
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>

                {/* Baulkham Hills High School (holiday camps) */}
                <div className="border-t border-white/[0.06] pt-8">
                  <p className="text-gray-500 text-[10px] font-heading tracking-[0.3em] uppercase mb-2">
                    Holiday camps &middot; Baulkham Hills
                  </p>
                  <h3 className="font-heading text-2xl text-[#9B4FDE] mb-3 tracking-wide">BAULKHAM HILLS HIGH SCHOOL</h3>
                  <address className="not-italic space-y-1 text-gray-300 text-sm">
                    <p className="text-white text-base">Baulkham Hills High School</p>
                    <p>Windsor Road, Baulkham Hills</p>
                    <p>NSW 2153</p>
                  </address>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Baulkham+Hills+High+School"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#9B4FDE] text-xs font-medium hover:text-white transition-colors mt-3"
                  >
                    Directions
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </a>
                </div>

                <div className="border-t border-white/[0.06] pt-6">
                  <p className="text-gray-500 text-xs leading-relaxed">
                    Indoor courts at both venues. Plenty of parking. Sessions run rain or shine.
                  </p>
                </div>
              </div>
            </SectionReveal>
            {/* Google Maps */}
            <SectionReveal delay={0.15}>
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden bg-[#111]">
                <iframe
                  src="https://www.google.com/maps?q=Bennelong+Sports+Centre+West+Ryde&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Obsidian Volleyball Academy location"
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">COMMON QUESTIONS</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">FAQ</h2>
            </div>
          </SectionReveal>
          <div className="space-y-0">
            {faqs.map((faq, i) => (
              <SectionReveal key={i} delay={i * 0.05}>
                <details className="group border-b border-white/[0.06]">
                  <summary className="flex justify-between items-center py-6 cursor-pointer list-none select-none">
                    <span className="font-heading text-xl text-white tracking-wide pr-4 group-hover:text-[#9B4FDE] transition-colors">
                      {faq.q}
                    </span>
                    <span className="text-gray-600 flex-shrink-0 text-sm font-heading tracking-widest group-open:text-[#9B4FDE] transition-colors">
                      +
                    </span>
                  </summary>
                  <div className="pb-6 text-gray-500 text-sm leading-relaxed">{faq.a}</div>
                </details>
              </SectionReveal>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/faq" className="text-gray-600 hover:text-[#9B4FDE] text-sm transition-colors">
              See all questions &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
