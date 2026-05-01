import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";
import Link from "next/link";

const suburbs = [
  {
    slug: "castle-hill",
    name: "Castle Hill",
    drive: "5 minutes",
    description: "Just a short drive down Old Northern Road from Castle Hill to our Baulkham Hills venue.",
  },
  {
    slug: "kellyville",
    name: "Kellyville",
    drive: "8 minutes",
    description: "A quick trip via Windsor Road from Kellyville to Baulkham Hills High School.",
  },
  {
    slug: "cherrybrook",
    name: "Cherrybrook",
    drive: "10 minutes",
    description: "Head south via New Line Road or Castle Hill Road from Cherrybrook to reach us.",
  },
  {
    slug: "bella-vista",
    name: "Bella Vista",
    drive: "8 minutes",
    description: "An easy drive east along Norwest Boulevard and Windsor Road from Bella Vista.",
  },
  {
    slug: "winston-hills",
    name: "Winston Hills",
    drive: "5 minutes",
    description: "Right next door. Winston Hills families can be at our venue in minutes via Windsor Road.",
  },
  {
    slug: "northmead",
    name: "Northmead",
    drive: "7 minutes",
    description: "Head north via Windsor Road from Northmead for quick access to quality volleyball coaching.",
  },
  {
    slug: "carlingford",
    name: "Carlingford",
    drive: "12 minutes",
    description: "Take Pennant Hills Road and Windsor Road from Carlingford to reach Baulkham Hills.",
  },
  {
    slug: "west-pennant-hills",
    name: "West Pennant Hills",
    drive: "10 minutes",
    description: "A straightforward drive via Castle Hill Road and Windsor Road from West Pennant Hills.",
  },
  {
    slug: "dural",
    name: "Dural",
    drive: "12 minutes",
    description: "Head south via Old Northern Road from Dural for easy access to the Hills District venue.",
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
      description: `Junior volleyball academy ${data.drive} from ${data.name}. Holiday camps and term programs at Baulkham Hills High School for ages 8 to 18. Book now.`,
      keywords: [
        `volleyball ${data.name.toLowerCase()}`,
        `junior volleyball ${data.name.toLowerCase()}`,
        `volleyball camp ${data.name.toLowerCase()}`,
        `volleyball academy near ${data.name.toLowerCase()}`,
        `kids volleyball ${data.name.toLowerCase()}`,
      ],
      alternates: { canonical: `/areas/${data.slug}` },
      openGraph: {
        title: `Volleyball Academy Near ${data.name}`,
        description: `Junior volleyball ${data.drive} from ${data.name}. Holiday camps and term programs.`,
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
              {data.description} Obsidian Volleyball Academy runs holiday camps and term programs
              for juniors aged 8–18, from complete beginners to advanced players.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <TrackedBookingLink
                location="hero"
                className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
              >
                BOOK A CAMP
              </TrackedBookingLink>
              <Link
                href="/holiday-camp"
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
                title: "HOLIDAY CAMPS",
                desc: "Full-day (9AM–1PM) and half-day sessions during school holidays. Beginner, intermediate, and advanced groups.",
              },
              {
                title: "ALL SKILL LEVELS",
                desc: "Grouped by ability, not age. Complete beginners are welcome. No experience needed to start.",
              },
              {
                title: "QUALIFIED COACHES",
                desc: "Accredited coaches with competitive playing experience and Working With Children Checks.",
              },
              {
                title: "INDOOR VENUE",
                desc: "Baulkham Hills High School gym. Indoor courts, free parking, weather never a problem.",
              },
              {
                title: "AFFORDABLE",
                desc: "$200 for a 5-day package (includes free shirt), $50 per day, or $35 for a half-day session.",
              },
              {
                title: `${data.drive.toUpperCase()} DRIVE`,
                desc: `${data.description} Easy access with free on-site parking.`,
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
                  <p className="text-white text-lg">Baulkham Hills High School</p>
                  <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills</p>
                  <p className="text-gray-500 text-sm">NSW 2153</p>
                </address>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Free parking on-site. Indoor courts. Central to {data.name}, Castle Hill,
                  Kellyville, and the wider Hills District.
                </p>
                <a
                  href="https://www.google.com/maps/place/Obsidian+Volleyball+Academy"
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
                  src="https://www.google.com/maps?q=Obsidian+Volleyball+Academy&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Obsidian Volleyball Academy near ${data.name}`}
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
            <TrackedBookingLink
              location="hero"
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </TrackedBookingLink>
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
