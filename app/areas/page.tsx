import type { Metadata } from "next";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";

export const metadata: Metadata = {
  title: "Service Areas | Junior Volleyball Sydney | Obsidian Volleyball Academy",
  description:
    "Obsidian Volleyball Academy runs term programs in West Ryde and holiday camps in Baulkham Hills. Find your suburb and see how close you are.",
  keywords: [
    "junior volleyball Sydney",
    "volleyball coaching West Ryde",
    "volleyball coaching Baulkham Hills",
    "volleyball academy near me Sydney",
  ],
  alternates: { canonical: "/areas" },
};

const rydeCluster = [
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

const hillsCluster = [
  { slug: "baulkham-hills", name: "Baulkham Hills", drive: "On site" },
  { slug: "castle-hill", name: "Castle Hill", drive: "8 min" },
  { slug: "north-rocks", name: "North Rocks", drive: "7 min" },
  { slug: "winston-hills", name: "Winston Hills", drive: "8 min" },
  { slug: "bella-vista", name: "Bella Vista", drive: "10 min" },
  { slug: "northmead", name: "Northmead", drive: "10 min" },
  { slug: "kellyville", name: "Kellyville", drive: "12 min" },
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://obsidianvolleyball.com" },
    { "@type": "ListItem", position: 2, name: "Service Areas", item: "https://obsidianvolleyball.com/areas" },
  ],
};

interface ClusterProps {
  badge: string;
  title: string;
  venueLine: string;
  venueLink: { href: string; label: string };
  areas: { slug: string; name: string; drive: string }[];
}

function Cluster({ badge, title, venueLine, venueLink, areas }: ClusterProps) {
  return (
    <section className="py-20 lg:py-28 bg-[#0A0A0A] border-t border-white/[0.04] first:border-t-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">{badge}</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide mb-3">
                {title}
              </h2>
              <p className="text-gray-500 text-sm">{venueLine}</p>
            </div>
            <Link
              href={venueLink.href}
              className="text-[#7E57C2] text-sm hover:text-white transition-colors whitespace-nowrap"
            >
              {venueLink.label} &rarr;
            </Link>
          </div>
        </SectionReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
          {areas.map((area, i) => (
            <SectionReveal key={area.slug} delay={i * 0.04}>
              <Link
                href={`/areas/${area.slug}`}
                className="block bg-[#0A0A0A] p-8 lg:p-10 group hover:bg-[#141114] transition-colors duration-500 h-full"
              >
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-3">
                  {area.drive.toUpperCase()}
                </p>
                <h3 className="font-heading text-3xl text-white tracking-wide mb-3 group-hover:text-[#7E57C2] transition-colors duration-300">
                  {area.name.toUpperCase()}
                </h3>
                <p className="text-gray-500 text-sm">
                  Junior volleyball for {area.name} families &rarr;
                </p>
              </Link>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AreasIndexPage() {
  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">SYDNEY</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              SERVICE
              <br />
              <span className="text-[#7E57C2]">AREAS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Obsidian Volleyball Academy runs Friday term programs at Obsidian Volleyball Academy West Ryde,
              West Ryde, and school-holiday camps at Baulkham Hills High School. Find your
              suburb and pick the venue closest to you.
            </p>
          </SectionReveal>
        </div>
      </section>

      <Cluster
        badge="WEST RYDE &middot; TERM PROGRAMS"
        title="INNER NORTH-WEST"
        venueLine="Friday evening classes at Obsidian Volleyball Academy West Ryde."
        venueLink={{ href: "/west-ryde", label: "West Ryde venue" }}
        areas={rydeCluster}
      />

      <Cluster
        badge="BAULKHAM HILLS &middot; HOLIDAY CAMPS"
        title="HILLS DISTRICT"
        venueLine="School-holiday camps at Baulkham Hills High School, Windsor Road."
        venueLink={{ href: "/baulkham-hills", label: "Baulkham Hills venue" }}
        areas={hillsCluster}
      />

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">READY TO START?</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK YOUR
              <br />
              <span className="text-[#7E57C2]">PLACE</span>
            </h2>
            <TrackedBookingLink
              location="areas_index_cta"
              className="inline-block bg-[#5E35A8] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </TrackedBookingLink>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
