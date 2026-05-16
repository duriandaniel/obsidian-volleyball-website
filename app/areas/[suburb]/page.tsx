import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

type Venue = "bennelong" | "bhhs";

interface Suburb {
  slug: string;
  name: string;
  venue: Venue;
  drive: string;
  description: string;
  /** Optional 2-3 paragraph body for richer suburb pages. */
  body?: string[];
}

const BENNELONG = {
  id: "bennelong" as const,
  name: "Bennelong Sports Centre",
  city: "West Ryde",
  mapQuery: "Bennelong+Sports+Centre+West+Ryde",
  mapTitle: "Bennelong Sports Centre, West Ryde",
  programLabel: "Term programs every Friday",
  programDetail:
    "Two indoor courts, four weekly classes (beginner, intermediate, advanced) every Friday from 4:00 to 7:00 PM.",
  ctaHref: "/term-programs",
  ctaLabel: "VIEW SCHEDULE",
  cardCta: "Junior volleyball classes near {name}",
  hubHref: "/west-ryde",
  hubLabel: "West Ryde venue details",
};

const BHHS = {
  id: "bhhs" as const,
  name: "Baulkham Hills High School",
  city: "Baulkham Hills",
  mapQuery: "Baulkham+Hills+High+School",
  mapTitle: "Baulkham Hills High School",
  programLabel: "School-holiday camps",
  programDetail:
    "Three indoor courts, ages 8 to 18, all skill levels. Five-day blocks of 9 AM to 1 PM camps every NSW school holiday period.",
  ctaHref: "/holiday-camp",
  ctaLabel: "VIEW CAMP DETAILS",
  cardCta: "Junior volleyball camps for {name} families",
  hubHref: "/baulkham-hills",
  hubLabel: "Baulkham Hills venue details",
};

const VENUES = { bennelong: BENNELONG, bhhs: BHHS } as const;

const suburbs: Suburb[] = [
  // Ryde cluster — term programs at Bennelong
  {
    slug: "ryde",
    name: "Ryde",
    venue: "bennelong",
    drive: "3 minutes",
    description: "Right next door. Ryde families are minutes from Bennelong Sports Centre.",
  },
  {
    slug: "eastwood",
    name: "Eastwood",
    venue: "bennelong",
    drive: "5 minutes",
    description: "A quick trip from Eastwood to our West Ryde venue.",
  },
  {
    slug: "meadowbank",
    name: "Meadowbank",
    venue: "bennelong",
    drive: "5 minutes",
    description: "An easy drive from Meadowbank to Bennelong Sports Centre.",
  },
  {
    slug: "denistone",
    name: "Denistone",
    venue: "bennelong",
    drive: "5 minutes",
    description: "Just up the road from Denistone to our West Ryde courts.",
  },
  {
    slug: "top-ryde",
    name: "Top Ryde",
    venue: "bennelong",
    drive: "5 minutes",
    description: "Top Ryde families can be at the venue in minutes.",
  },
  {
    slug: "putney",
    name: "Putney",
    venue: "bennelong",
    drive: "7 minutes",
    description: "A short drive from Putney to Bennelong Sports Centre, West Ryde.",
  },
  {
    slug: "north-ryde",
    name: "North Ryde",
    venue: "bennelong",
    drive: "8 minutes",
    description: "An easy run from North Ryde down to our West Ryde venue.",
  },
  {
    slug: "marsfield",
    name: "Marsfield",
    venue: "bennelong",
    drive: "8 minutes",
    description: "From Marsfield, a quick drive south to Bennelong Sports Centre.",
  },
  {
    slug: "macquarie-park",
    name: "Macquarie Park",
    venue: "bennelong",
    drive: "10 minutes",
    description: "Macquarie Park families travel a short distance to West Ryde for premium coaching.",
  },

  // Hills cluster — holiday camps at Baulkham Hills High School
  {
    slug: "baulkham-hills",
    name: "Baulkham Hills",
    venue: "bhhs",
    drive: "On your doorstep",
    description:
      "Camps run right here in Baulkham Hills. The high school sits on Windsor Road, central to the whole suburb.",
    body: [
      "Baulkham Hills is the home of Obsidian's school-holiday volleyball program. Camps run at Baulkham Hills High School on Windsor Road — a venue most local families know, with three indoor courts and free parking right at the gate. For Baulkham Hills families, it's about as convenient as junior sport gets: no traffic on Pennant Hills Road, no long drive across the M2, just a short trip down the road.",
      "The camp setup is purpose-built for kids who want real volleyball coaching during the holidays. Three courts means three ability streams (beginner, intermediate, advanced) running side by side, so an eight-year-old picking up a volleyball for the first time and a sixteen-year-old playing club competition both get a session pitched at their level. Coaches all hold current Working With Children Checks and most have played at NSWCHS, state, or premier-league level — they're not gap-year casuals.",
      "Local families pick Obsidian because there's nothing else like it nearby. Most Hills volleyball happens through school CHS programs or one-off clinics; we run a structured, multi-day camp every holiday period with the same coaching team and the same progression each block. Kids come back five mornings in a row and you can see the difference by Friday. Bring volleyball-suitable shoes, a water bottle, and a snack — we take care of the rest.",
    ],
  },
  {
    slug: "castle-hill",
    name: "Castle Hill",
    venue: "bhhs",
    drive: "8 minutes",
    description:
      "A quick run down Windsor Road from Castle Hill to Baulkham Hills High School.",
    body: [
      "Castle Hill sits an easy eight minutes from Baulkham Hills High School — straight down Windsor Road, no major intersections to fight through. For Castle Hill families who've been driving their kids over to the Northern Beaches or city sport clubs, Obsidian's holiday camps cut the round-trip travel time dramatically. Drop-off is at the school gate on Windsor Road, parking is free and plentiful, and pick-up at 1 PM lands neatly before the lunch rush.",
      "Castle Hill has plenty of kids playing school volleyball through The Hills Sports High, Castle Hill High, and the private schools nearby — but most of them have nowhere structured to train outside of the school season. Obsidian's holiday camps fill that gap. Five mornings of focused coaching, ability-grouped, with enough volume of touches that players actually improve rather than just stay sharp. Beginners welcome too: we teach the game from zero on a separate court.",
      "Camp dates align with the NSW public school holidays, so it works for kids from any Castle Hill school. The 9 AM to 1 PM block leaves the rest of the day free for family time or other commitments. Most Castle Hill kids car-pool with a couple of mates — let us know if you want to be put in touch with other families coming from the same area.",
    ],
  },
  {
    slug: "bella-vista",
    name: "Bella Vista",
    venue: "bhhs",
    drive: "10 minutes",
    description:
      "Bella Vista families travel ten minutes east to Baulkham Hills High School for Obsidian's camps.",
    body: [
      "Bella Vista is ten minutes east of Baulkham Hills High School — a clean run along Old Windsor Road and Windsor Road, almost no traffic during school holidays. For Bella Vista families used to driving across Norwest for sport, our Baulkham Hills venue is actually closer than most of the alternatives, and the camp structure means you're not stuck doing five separate drop-offs across the week.",
      "The Bella Vista catchment has grown fast with young families, and there's real demand for premium junior sport that doesn't require a year-long commitment. Obsidian's holiday camps suit that profile perfectly: pick a five-day block (or even a single day if you want to test it out), get the kids coached properly for four hours a morning, and book again next holiday only if you liked it. No annual fees, no club politics.",
      "The camp itself splits players across three courts by ability so a Bella Vista eight-year-old who's never touched a volleyball gets a totally different session to a Bella Vista fifteen-year-old who's already in their school's senior team. Coaches with state or premier-league playing backgrounds, current Working With Children Checks, small ratios, structured progression each day. Bring shoes, water, and snacks — we'll handle the rest.",
    ],
  },
  {
    slug: "kellyville",
    name: "Kellyville",
    venue: "bhhs",
    drive: "12 minutes",
    description:
      "Twelve minutes from Kellyville to Baulkham Hills High School via Windsor Road.",
    body: [
      "Kellyville families head south down Windsor Road to reach Baulkham Hills High School — around twelve minutes door-to-door, less during holiday periods when commuter traffic drops off. It's a noticeably easier run than driving into Castle Towers or further afield for sport. Free parking at the school gate, drop-off at 9 AM, pick-up at 1 PM, and the kids are coached properly in between.",
      "Junior volleyball is still emerging in Kellyville — most local kids hit the sport at high school and stick with it, but there are limited places to train outside of the school competition season. Obsidian's holiday camps are designed for exactly that gap. The five-day Monday-to-Friday block gives players enough volume to actually improve, not just maintain. Beginners are welcome and get their own court; nobody gets thrown into a senior session and left to drown.",
      "We run camps every NSW public school holiday period. Most Kellyville families book the full five-day pack because the per-day rate works out cheapest and the included Obsidian training jersey is genuinely good (Mt Sportswear HK make them). Single-day and half-day options exist if your schedule won't allow the full week. Multiple kids from the same family welcome — let us know at booking and we'll keep them grouped.",
    ],
  },
  {
    slug: "north-rocks",
    name: "North Rocks",
    venue: "bhhs",
    drive: "7 minutes",
    description:
      "Just seven minutes from North Rocks to Baulkham Hills High School.",
    body: [
      "North Rocks sits about seven minutes south of Baulkham Hills High School — quick along North Rocks Road, no major arterials to navigate. It's one of the easier suburbs in the Hills District for reaching our holiday camp venue. Families from Carlingford and beyond come through North Rocks on the same route, so car-pooling works naturally if you know other parents heading along.",
      "Volleyball is well represented at local schools like Muirfield High and Cumberland High, but there's almost no structured holiday programming for it locally. That's where Obsidian's camps land. Five mornings of real volleyball coaching at Baulkham Hills High School — three ability streams running in parallel, coaches with high-level playing backgrounds, structured progression across the week. Players who've been frustrated by the lack of options outside school terms usually keep coming back.",
      "Camp blocks line up with NSW public school holidays. The 9 AM to 1 PM session length is deliberately calibrated: enough time for proper warm-up, technical work, and game play, but short enough that kids don't burn out by Wednesday. Bring shoes that grip on an indoor floor, a water bottle, and something to eat. We handle the rest.",
    ],
  },
  {
    slug: "winston-hills",
    name: "Winston Hills",
    venue: "bhhs",
    drive: "8 minutes",
    description:
      "Winston Hills to Baulkham Hills High School is an eight-minute run via Old Windsor Road.",
    body: [
      "Winston Hills is roughly eight minutes from Baulkham Hills High School via Old Windsor Road — a fast straight line during school holidays. The drive avoids the M2 entirely, which means Winston Hills families aren't paying tolls or fighting commuter traffic to get their kids to a holiday camp. Drop-off and pick-up at the school gate is straightforward, with plenty of free on-site parking.",
      "There's a steady base of junior volleyball talent across Winston Hills schools, but the same problem as the rest of the Hills District: outside the school term, options thin out fast. Obsidian's holiday camps were built to plug that hole. Five-day blocks of coaching, ability-streamed across three courts, with coaches who've genuinely competed at high levels. Beginners welcome — a real first-timer court rather than getting absorbed into a mixed group.",
      "Camp dates run during NSW public school holiday weeks. Five-day pack is the most popular option (best per-day rate, includes a free Obsidian training jersey), but you can book single days if a five-day commitment doesn't fit the family schedule. Multiple kids in one family is no problem; just flag at booking and we'll keep them on appropriate courts.",
    ],
  },
  {
    slug: "northmead",
    name: "Northmead",
    venue: "bhhs",
    drive: "10 minutes",
    description:
      "Ten minutes from Northmead to Baulkham Hills High School via Windsor Road.",
    body: [
      "Northmead sits about ten minutes south-east of Baulkham Hills High School — Windsor Road runs the whole way and there's no need to touch the M2 or Pennant Hills Road. For Northmead families who've been driving over to Parramatta or beyond for junior sport, our Baulkham Hills venue is genuinely closer and quieter, especially during NSW school holiday periods when commuter traffic eases.",
      "Local schools across Northmead have plenty of kids interested in volleyball, but most of that interest never gets a structured outlet outside the school competition season. Obsidian's holiday camps fill that gap. Three indoor courts at Baulkham Hills High, ability-streamed groups so beginners and advanced players each get a session pitched at their level, and a coaching team with real playing backgrounds at state and premier-league level.",
      "Camp blocks run Monday to Friday, 9 AM to 1 PM, every NSW public school holiday period. The five-day pack works out cheapest per day and includes a free Obsidian training jersey; you can also book individual days or half-day morning sessions if scheduling makes that easier. Drop the kids at 9 AM with shoes, water, and a snack, and pick them up at 1 PM with five hours of better volleyball under their belt.",
    ],
  },
];

export function generateStaticParams() {
  return suburbs.map((s) => ({ suburb: s.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ suburb: string }> }): Promise<Metadata> {
  return params.then(({ suburb }) => {
    const data = suburbs.find((s) => s.slug === suburb);
    if (!data) return { title: "Area Not Found" };
    const isCamp = data.venue === "bhhs";
    return {
      title: `Volleyball Coaching ${data.name} | ${
        isCamp ? "Junior Camps" : "Junior Classes"
      } | Obsidian Volleyball Academy`,
      description: isCamp
        ? `Junior volleyball holiday camps for ${data.name} families. School-holiday programs at Baulkham Hills High School for ages 8 to 18. ${data.drive} away.`
        : `Junior volleyball coaching for ${data.name} families. Friday term programs at Bennelong Sports Centre, West Ryde, for ages 8 to 18. ${data.drive} away. Book now.`,
      keywords: [
        `volleyball ${data.name.toLowerCase()}`,
        `junior volleyball ${data.name.toLowerCase()}`,
        `volleyball coaching ${data.name.toLowerCase()}`,
        `kids volleyball ${data.name.toLowerCase()}`,
        isCamp
          ? `volleyball camp ${data.name.toLowerCase()}`
          : `volleyball lessons ${data.name.toLowerCase()}`,
      ],
      alternates: { canonical: `/areas/${data.slug}` },
      openGraph: {
        title: `Volleyball Coaching in ${data.name}`,
        description: isCamp
          ? `Junior volleyball camps ${data.drive} from ${data.name}. Baulkham Hills High School.`
          : `Junior volleyball ${data.drive} from ${data.name}. Bennelong Sports Centre, West Ryde.`,
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

  const venue = VENUES[data.venue];
  const isCamp = data.venue === "bhhs";
  const otherSuburbs = suburbs
    .filter((s) => s.slug !== suburb && s.venue === data.venue)
    .slice(0, 4);

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

  const offerCards = isCamp
    ? [
        {
          title: "HOLIDAY CAMPS",
          desc: "Five-day Monday-to-Friday camps every NSW school holiday period. 9 AM to 1 PM. Three courts split by skill level.",
        },
        {
          title: "ALL SKILL LEVELS",
          desc: "Beginner, intermediate, advanced — each on its own court. Grouped by ability, not age. Complete beginners welcome.",
        },
        {
          title: "EXPERT COACHES",
          desc: "Accredited coaches with competitive playing experience and current Working With Children Checks.",
        },
        {
          title: "INDOOR VENUE",
          desc: "Three indoor courts at Baulkham Hills High School. Free on-site parking, climate-controlled, rain or shine.",
        },
        {
          title: "FLEXIBLE BOOKING",
          desc: "Five-day pack (best value, includes free jersey), single day, or half-day options to fit the family schedule.",
        },
        {
          title: `${data.drive.toUpperCase()} AWAY`,
          desc: data.description,
        },
      ]
    : [
        {
          title: "TERM PROGRAMS",
          desc: "Four 90-minute classes every Friday at Bennelong Sports Centre. Beginner, intermediate, advanced.",
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
          desc: data.description,
        },
      ];

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">
              {data.drive.toUpperCase()} {data.drive === "On your doorstep" ? "" : `FROM ${data.name.toUpperCase()}`}
            </p>
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl text-white tracking-wide mb-8 leading-[0.9]">
              VOLLEYBALL
              <br />
              {isCamp ? "CAMPS FOR" : "ACADEMY NEAR"}
              <br />
              <span className="text-[#9B4FDE]">{data.name.toUpperCase()}</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-10">
              {data.description} {isCamp
                ? `Obsidian Volleyball Academy runs school-holiday camps at Baulkham Hills High School for juniors aged 8 to 18, from complete beginners to advanced players.`
                : `Obsidian Volleyball Academy runs term programs every Friday at Bennelong Sports Centre, West Ryde, for juniors aged 8 to 18, from complete beginners to advanced players.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={venue.ctaHref}
                className="bg-[#7B2FBE] text-white font-heading text-xl px-8 py-4 hover:bg-white transition-all duration-300 tracking-wide text-center glow-purple"
              >
                BOOK NOW
              </Link>
              <Link
                href={venue.ctaHref}
                className="border border-white/20 text-white font-heading text-xl px-8 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide text-center"
              >
                {venue.ctaLabel}
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Long-form body (if provided) */}
      {data.body && data.body.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#0F0F0F]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionReveal>
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                FOR {data.name.toUpperCase()} FAMILIES
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide mb-10">
                WHY OBSIDIAN
              </h2>
              <div className="space-y-6 text-gray-400 text-base leading-relaxed">
                {data.body.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </SectionReveal>
          </div>
        </section>
      )}

      {/* What we offer */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-16">
              <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                FOR {data.name.toUpperCase()} FAMILIES
              </p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white tracking-wide">WHAT WE OFFER</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.04]">
            {offerCards.map((item, i) => (
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
                <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">
                  {data.drive.toUpperCase()} {data.drive === "On your doorstep" ? "" : `FROM ${data.name.toUpperCase()}`}
                </p>
                <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide mb-8">VENUE</h2>
                <address className="not-italic space-y-2 mb-6">
                  <p className="text-white text-lg">{venue.name}</p>
                  <p className="text-gray-500 text-sm">{venue.city}, NSW</p>
                </address>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{venue.programDetail}</p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${venue.mapQuery}`}
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
                <Link
                  href={venue.hubHref}
                  className="inline-flex items-center gap-2 text-gray-500 text-sm hover:text-[#9B4FDE] transition-colors"
                >
                  {venue.hubLabel}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[300px] overflow-hidden bg-[#111]">
                <iframe
                  src={`https://www.google.com/maps?q=${venue.mapQuery}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${venue.mapTitle} near ${data.name}`}
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
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">
              {data.drive === "On your doorstep" ? "RIGHT HERE" : `JUST ${data.drive.toUpperCase()} AWAY`}
            </p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">
              BOOK YOUR
              <br />
              <span className="text-[#9B4FDE]">PLACE</span>
            </h2>
            <Link
              href={venue.ctaHref}
              className="inline-block bg-[#7B2FBE] text-white font-heading text-3xl px-14 py-5 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
            >
              BOOK NOW
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* Other suburbs in the same cluster */}
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
            <Link href="/areas" className="text-gray-500 text-sm hover:text-[#9B4FDE] transition-colors">
              All areas &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
