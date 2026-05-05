import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

const suburbs = [
  {
    slug: "ryde",
    name: "Ryde",
    drive: "3 minutes",
    description: "Right next door. Ryde families are minutes from Bennelong Sports Centre.",
  },
  {
    slug: "eastwood",
    name: "Eastwood",
    drive: "5 minutes",
    description: "A quick trip from Eastwood to our West Ryde venue.",
  },
  {
    slug: "meadowbank",
    name: "Meadowbank",
    drive: "5 minutes",
    description: "An easy drive from Meadowbank to Bennelong Sports Centre.",
  },
  {
    slug: "denistone",
    name: "Denistone",
    drive: "5 minutes",
    description: "Just up the road from Denistone to our West Ryde courts.",
  },
  {
    slug: "top-ryde",
    name: "Top Ryde",
    drive: "5 minutes",
    description: "Top Ryde families can be at the venue in minutes.",
  },
  {
    slug: "putney",
    name: "Putney",
    drive: "7 minutes",
    description: "A short drive from Putney to Bennelong Sports Centre, West Ryde.",
  },
  {
    slug: "north-ryde",
    name: "North Ryde",
    drive: "8 minutes",
    description: "An easy run from North Ryde down to our West Ryde venue.",
  },
  {
    slug: "marsfield",
    name: "Marsfield",
    drive: "8 minutes",
    description: "From Marsfield, a quick drive south to Bennelong Sports Centre.",
  },
  {
    slug: "macquarie-park",
    name: "Macquarie Park",
    drive: "10 minutes",
    description: "Macquarie Park families travel a short distance to West Ryde for premium coaching.",
  },
];

export function generateStaticParams() {
  return suburbs.map((s) => ({ suburb: s.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ suburb: string }> }): Promise<Metadata> {
  // Need to resolve params synchronously for static generation
  return params.then(({ suburb }) => {
    const data = suburbs.find((s) => s.slug === suburb);
    if (!data) return { title: "Area Not Found" };
    return {
      title: `Volleyball Academy Near ${data.name} | Junior Volleyball ${data.name}`,
      description: `Premium junior volleyball academy ${data.drive} from ${data.name}. Term programs at Bennelong Sports Centre, West Ryde, for ages 8 to 18. Book now.`,
      keywords: [
        `volleyball ${data.name.toLowerCase()}`,
        `junior volleyball ${data.name.toLowerCase()}`,
        `volleyball coaching ${data.name.toLowerCase()}`,
        `volleyball academy near ${data.name.toLowerCase()}`,
        `kids volleyball ${data.name.toLowerCase()}`,
      ],
      alternates: { canonical: `/areas/${data.slug}` },
      openGraph: {
        title: `Volleyball Academy Near ${data.name}`,
        description: `Premium junior volleyball ${data.drive} from ${data.name}. Term programs at Bennelong Sports Centre, West Ryde.`,
        url: `/areas/${data.slug}`,
        images: ["/images/hero.jpg"],
      },
    };
  });
}

export default async function SuburbPage({ params }: { params: Promise<{ suburb: string }> }) {
  const { suburb } = await params;
  const data = suburbs.find((s) => s.slug === suburb);

  if (!data) {
    return (
      <div className="pt-20 min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="text-gray-500">Area not found.</p>
      </div>
    );
  }

  const otherSuburbs = suburbs.filter((s) => s.slug !== suburb).slice(0, 4);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://obsidianvolleyball.com" },
      { "@type": "ListItem", position: 2, name: "Service Areas", item: "https://obsidianvolleyball.com/areas" },
      {
        "@type": "ListItem",
        position: 3,
        name: data.name,
        item: `https://obsidianvolleyball.com/areas/${data.slug}`,
      },
    ],
  };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              {data.drive.toUpperCase()} FROM {data.name.toUpperCase()}
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl text-white tracking-wide mb-8 leading-[0.9]">
              VOLLEYBALL
              <br />
              ACADEMY NEAR
              <br />
              <span className="text-[#9B4FDE]">{data.name.toUpperCase()}</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-10">
              {data.description} Obsidian Volleyball Academy runs term programs every Friday
              at Bennelong Sports Centre, West Ryde, for juniors aged 8 to 18, from complete
              beginners to advanced players.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/term-programs"
                className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
              >
                BOOK NOW
              </Link>
              <Link
                href="/term-programs"
                className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
              >
                VIEW PROGRAMS
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">FOR {data.name.toUpperCase()} FAMILIES</p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide">WHAT WE OFFER</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {[
              {
                title: "TERM PROGRAMS",
                desc: "Three two-hour sessions every Friday at Bennelong Sports Centre, West Ryde. Beginner, intermediate, and advanced groups.",
              },
              {
                title: "ALL SKILL LEVELS",
                desc: "Grouped by ability, not age. Complete beginners are welcome. No experience needed to start.",
              },
              {
                title: "EXPERT COACHES",
                desc: "Accredited coaches with competitive playing experience and Working With Children Checks. The reason families pick us.",
              },
              {
                title: "INDOOR VENUE",
                desc: "Two indoor courts at Bennelong Sports Centre. Climate-controlled, ample parking, sessions run rain or shine.",
              },
              {
                title: "PREMIUM COACHING",
                desc: "Small groups, high coach-to-player ratio, structured curriculum. We don't compete on price; we compete on quality.",
              },
              {
                title: `${data.drive.toUpperCase()} DRIVE`,
                desc: `${data.description}`,
              },
            ].map((item, i) => (
              <SectionReveal key={item.title} delay={i * 0.05}>
                <div className="bg-[#111] p-8 group hover:bg-[#161616] transition-colors duration-500">
                  <h3 className="font-heading text-xl text-[#9B4FDE] tracking-wide mb-3 group-hover:text-white transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 lg:gap-12">
            <SectionReveal>
              <div>
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">{data.drive.toUpperCase()} FROM {data.name.toUpperCase()}</p>
                <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide mb-8">VENUE</h2>
                <address className="not-italic space-y-2 mb-6">
                  <p className="text-white text-lg">Bennelong Sports Centre</p>
                  <p className="text-gray-500 text-sm">West Ryde, NSW</p>
                </address>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Two indoor courts. Plenty of parking. A short drive from {data.name} and
                  surrounding suburbs.
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Bennelong+Sports+Centre+West+Ryde"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors"
                >
                  Get directions from {data.name}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </SectionReveal>
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
                  title={`Bennelong Sports Centre near ${data.name}`}
                />
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">JUST {data.drive.toUpperCase()} AWAY</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK YOUR
              <br />
              <span className="text-[#9B4FDE]">PLACE</span>
            </h2>
            <Link
              href="/term-programs"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* Other areas */}
      <section className="py-16 lg:py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 text-xs tracking-wider mb-6">ALSO SERVING</p>
          <div className="flex flex-wrap gap-3">
            {otherSuburbs.map((s) => (
              <Link
                key={s.slug}
                href={`/areas/${s.slug}`}
                className="text-gray-500 text-sm hover:text-[#9B4FDE] transition-colors"
              >
                {s.name}
              </Link>
            ))}
            <Link href="/contact" className="text-gray-500 text-sm hover:text-[#9B4FDE] transition-colors">
              All areas &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
