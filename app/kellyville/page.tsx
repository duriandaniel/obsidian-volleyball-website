import type { Metadata } from "next";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";

export const metadata: Metadata = {
  title: "Volleyball Coaching Kellyville | Obsidian Volleyball Academy Kellyville | Obsidian Volleyball Academy",
  description:
    "Junior volleyball coaching in Kellyville, Sydney. Tuesday and Wednesday term classes at Obsidian Volleyball Academy Kellyville for ages 8 to 18, all skill levels. Book a $25 trial class.",
  keywords: [
    "volleyball Kellyville",
    "volleyball coaching Kellyville",
    "junior volleyball Kellyville",
    "kids volleyball Kellyville",
    "Obsidian Volleyball Academy Kellyville",
    "volleyball lessons Kellyville",
    "volleyball academy Kellyville",
    "volleyball near me Kellyville",
  ],
  alternates: { canonical: "/kellyville" },
  openGraph: {
    title: "Volleyball Coaching Kellyville | Obsidian Volleyball Academy Kellyville",
    description:
      "Junior volleyball coaching in Kellyville at Obsidian Volleyball Academy Kellyville. Tuesday and Wednesday term classes for ages 8 to 18.",
    images: ["/images/gallery-spike.jpg"],
    url: "/kellyville",
  },
};

const venueSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Obsidian Volleyball Academy — Kellyville",
  description:
    "Junior volleyball coaching at Obsidian Volleyball Academy Kellyville. Tuesday and Wednesday term classes for ages 8 to 18.",
  url: "https://obsidianvolleyball.com/kellyville",
  image: "https://obsidianvolleyball.com/images/gallery-spike.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kellyville High School, cnr York Road & Queensbury Avenue",
    addressLocality: "Kellyville",
    addressRegion: "NSW",
    postalCode: "2155",
    addressCountry: "AU",
  },
  areaServed: [
    "Kellyville",
    "North Kellyville",
    "Bella Vista",
    "Beaumont Hills",
    "Rouse Hill",
    "Castle Hill",
    "Glenwood",
    "Stanhope Gardens",
    "Kellyville Ridge",
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
    { "@type": "ListItem", position: 2, name: "Kellyville", item: "https://obsidianvolleyball.com/kellyville" },
  ],
};

export default function KellyvillePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Hero
        eyebrow="OBSIDIAN VOLLEYBALL ACADEMY · KELLYVILLE"
        titleLine1="Kelly"
        titleLine2="ville"
        body="Quality junior volleyball coaching at Obsidian Volleyball Academy Kellyville. Tuesday and Wednesday afternoons at Kellyville High School, expert coaches. Term 2 enrolment open."
        primaryLocation="kellyville_hero"
      />
      <HomeSections />
    </>
  );
}
