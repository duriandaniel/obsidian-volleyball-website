import type { Metadata } from "next";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";

export const metadata: Metadata = {
  title: "Volleyball Coaching West Ryde | Obsidian Volleyball Academy West Ryde | Obsidian Volleyball Academy",
  description:
    "Junior volleyball coaching in West Ryde, Sydney. Friday evening term programs at Obsidian Volleyball Academy West Ryde for ages 8 to 18, all skill levels. Book a free trial.",
  keywords: [
    "volleyball West Ryde",
    "volleyball coaching West Ryde",
    "junior volleyball West Ryde",
    "kids volleyball West Ryde",
    "Obsidian Volleyball Academy West Ryde",
    "volleyball lessons West Ryde",
    "volleyball academy West Ryde",
    "volleyball near me Ryde",
  ],
  alternates: { canonical: "/west-ryde" },
  openGraph: {
    title: "Volleyball Coaching West Ryde | Obsidian Volleyball Academy West Ryde",
    description:
      "Junior volleyball coaching in West Ryde at Obsidian Volleyball Academy West Ryde. Friday term programs for ages 8 to 18.",
    images: ["/images/gallery-spike.jpg"],
    url: "/west-ryde",
  },
};

const venueSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Obsidian Volleyball Academy — West Ryde",
  description:
    "Junior volleyball coaching at Obsidian Volleyball Academy West Ryde. Friday evening term programs for ages 8 to 18.",
  url: "https://obsidianvolleyball.com/west-ryde",
  image: "https://obsidianvolleyball.com/images/gallery-spike.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Obsidian Volleyball Academy West Ryde",
    addressLocality: "West Ryde",
    addressRegion: "NSW",
    postalCode: "2114",
    addressCountry: "AU",
  },
  areaServed: [
    "West Ryde",
    "Ryde",
    "Eastwood",
    "Meadowbank",
    "Denistone",
    "Top Ryde",
    "Putney",
    "North Ryde",
    "Marsfield",
    "Macquarie Park",
  ],
  sport: "Volleyball",
  audience: {
    "@type": "PeopleAudience",
    suggestedMinAge: 8,
    suggestedMaxAge: 18,
  },
  parentOrganization: {
    "@type": "SportsOrganization",
    name: "Obsidian Volleyball Academy",
    url: "https://obsidianvolleyball.com",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://obsidianvolleyball.com" },
    { "@type": "ListItem", position: 2, name: "West Ryde", item: "https://obsidianvolleyball.com/west-ryde" },
  ],
};

export default function WestRydePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Hero
        eyebrow="OBSIDIAN VOLLEYBALL ACADEMY · WEST RYDE"
        titleLine1="West"
        titleLine2="Ryde"
        body="Quality junior volleyball coaching at Obsidian Volleyball Academy West Ryde. Friday evenings, two indoor courts, expert coaches. Term 2 enrolment open."
        primaryLocation="west_ryde_hero"
      />
      <HomeSections />
    </>
  );
}
