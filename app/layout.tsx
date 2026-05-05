import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";
import { GoogleTagManagerScript, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { MetaPixelScript, MetaPixelNoScript } from "@/components/MetaPixel";
import CookieConsent from "@/components/CookieConsent";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Obsidian Volleyball Academy | Junior Volleyball Sydney",
    template: "%s | Obsidian Volleyball Academy",
  },
  description:
    "Premium junior volleyball academy in Sydney. Term programs at Bennelong Sports Centre, West Ryde. Holiday camps at Baulkham Hills.",
  keywords: [
    "volleyball academy Sydney",
    "junior volleyball Sydney",
    "volleyball West Ryde",
    "volleyball Bennelong Sports Centre",
    "junior volleyball coaching Sydney",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Obsidian Volleyball Academy",
    title: "Obsidian Volleyball Academy | Junior Volleyball Sydney",
    description:
      "Premium junior volleyball academy in Sydney. Term programs in West Ryde.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Obsidian Volleyball Academy: Junior Volleyball in Sydney",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Obsidian Volleyball Academy | Junior Volleyball Sydney",
    description:
      "Premium junior volleyball academy in Sydney. Term programs in West Ryde.",
    images: ["/images/hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://obsidianvolleyball.com"),
  alternates: {
    canonical: "/",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const SITE_URL = "https://obsidianvolleyball.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Obsidian Volleyball Academy",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  email: "obsidianvolleyball@gmail.com",
  sameAs: ["https://instagram.com/obsidianvolleyball"],
  foundingDate: "2025",
  areaServed: { "@type": "AdministrativeArea", name: "Sydney, NSW" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "SportsActivityLocation"],
  "@id": `${SITE_URL}/#localbusiness`,
  name: "Obsidian Volleyball Academy",
  description:
    "Premium junior volleyball academy in Sydney. Term programs every Friday at Bennelong Sports Centre, West Ryde, for ages 8 to 18.",
  url: SITE_URL,
  image: `${SITE_URL}/images/hero.jpg`,
  email: "obsidianvolleyball@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "West Ryde",
    addressRegion: "NSW",
    addressCountry: "AU",
  },
  sport: "Volleyball",
  sameAs: ["https://instagram.com/obsidianvolleyball"],
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
    "Sydney",
  ],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "13:00",
      validFrom: "2025-01-01",
      description: "School holiday camps run weekdays during NSW school holidays.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <head>
        <GoogleTagManagerScript />
        <MetaPixelScript />
        <script dangerouslySetInnerHTML={{ __html: "window.dataLayer=window.dataLayer||[];" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-obsidian text-white">
        <GoogleTagManagerNoScript />
        <MetaPixelNoScript />
        <PromoBanner />
        <Nav />
        <main className="flex-1 pt-9">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
