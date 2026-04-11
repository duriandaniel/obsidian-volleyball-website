import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookingCTA from "@/components/BookingCTA";
import { GoogleTagManagerScript, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";

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
    default: "Obsidian Volleyball Academy | Junior Volleyball Sydney Hills District",
    template: "%s | Obsidian Volleyball Academy",
  },
  description:
    "Premium junior volleyball academy in Baulkham Hills, Sydney Hills District. Holiday camps and term programs for all skill levels.",
  keywords: [
    "volleyball academy Sydney",
    "junior volleyball Sydney",
    "volleyball holiday camp Hills District",
    "volleyball Baulkham Hills",
    "volleyball camp Castle Hill",
    "junior volleyball Hills District",
  ],
  openGraph: {
    type: "website",
    locale: "en_AU",
    siteName: "Obsidian Volleyball Academy",
    title: "Obsidian Volleyball Academy | Junior Volleyball Sydney",
    description:
      "Premium junior volleyball academy in Baulkham Hills. Holiday camps, term programs for all skill levels.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://obsidianvolleyball.com"),
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
        <script dangerouslySetInnerHTML={{ __html: "window.dataLayer=window.dataLayer||[];" }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsActivityLocation",
              name: "Obsidian Volleyball Academy",
              description:
                "Premium junior volleyball academy in Baulkham Hills, Sydney Hills District. Holiday camps and term programs.",
              url: "https://obsidianvolleyball.com",
              telephone: "",
              email: "obsidianvolleyball@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Baulkham Hills High School, Windsor Road",
                addressLocality: "Baulkham Hills",
                addressRegion: "NSW",
                postalCode: "2153",
                addressCountry: "AU",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -33.7627,
                longitude: 150.9927,
              },
              sport: "Volleyball",
              areaServed: [
                "Baulkham Hills",
                "Castle Hill",
                "Kellyville",
                "Cherrybrook",
                "Bella Vista",
                "Hills District",
                "Sydney",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-obsidian text-white">
        <GoogleTagManagerNoScript />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <BookingCTA />
      </body>
    </html>
  );
}
