import type { Metadata } from "next";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title: "Service Areas | Junior Volleyball Sydney | Obsidian Volleyball Academy",
  description:
    "Obsidian Volleyball Academy runs term programs at Bennelong Sports Centre, West Ryde. Find your suburb and see how close you are.",
  keywords: [
    "junior volleyball Sydney",
    "volleyball coaching West Ryde",
    "volleyball academy near me",
  ],
  alternates: { canonical: "/areas" },
};

const areas = [
  { slug: "ryde", name: "Ryde", drive: "3 min" },
  { slug: "eastwood", name: "Eastwood", drive: "5 min" },
  { slug: "meadowbank", name: "Meadowbank", drive: "5 min" },
  { slug: "denistone", name: "Denistone", drive: "5 min" },
  { slug: "top-ryde", name: "Top Ryde", drive: "5 min" },
  { slug: "putney", name: "Putney", drive: "7 min" },
  { slug: "north-ryde", name: "North Ryde", drive: "8 min" },
  { slug: "marsfield", name: "Marsfield", drive: "8 min" },
  { slug: "macquarie-park", name: "Macquarie Park", drive: "10 min" },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://obsidianvolleyball.com" },
    { "@type": "ListItem", position: 2, name: "Service Areas", item: "https://obsidianvolleyball.com/areas" },
  ],
};

export default function AreasIndexPage() {
  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">SYDNEY</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              SERVICE
              <br />
              <span className="text-[#9B4FDE]">AREAS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Obsidian Volleyball Academy runs term programs at Bennelong Sports Centre,
              West Ryde. Families travel from across Sydney for premium junior volleyball
              coaching. Find your suburb below.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Areas grid */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {areas.map((area, i) => (
              <SectionReveal key={area.slug} delay={i * 0.04}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="block bg-[#111] p-8 lg:p-10 group hover:bg-[#161616] transition-colors duration-500 h-full"
                >
                  <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">
                    {area.drive.toUpperCase()} AWAY
                  </p>
                  <h2 className="font-heading text-3xl text-white tracking-wide mb-3 group-hover:text-[#9B4FDE] transition-colors duration-300">
                    {area.name.toUpperCase()}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Junior volleyball coaching for {area.name} families &rarr;
                  </p>
                </Link>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">READY TO START?</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK YOUR
              <br />
              <span className="text-[#9B4FDE]">PLACE</span>
            </h2>
            <TrackedBookingLink
              location="areas_index_cta"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK A CAMP
            </TrackedBookingLink>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
