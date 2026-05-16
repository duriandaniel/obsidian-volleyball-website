import Link from "next/link";
import Image from "next/image";

const rydeAreas = [
  { slug: "ryde", name: "Ryde" },
  { slug: "eastwood", name: "Eastwood" },
  { slug: "meadowbank", name: "Meadowbank" },
  { slug: "denistone", name: "Denistone" },
  { slug: "north-ryde", name: "North Ryde" },
  { slug: "marsfield", name: "Marsfield" },
  { slug: "putney", name: "Putney" },
  { slug: "top-ryde", name: "Top Ryde" },
  { slug: "macquarie-park", name: "Macquarie Park" },
];

const hillsAreas = [
  { slug: "baulkham-hills", name: "Baulkham Hills" },
  { slug: "castle-hill", name: "Castle Hill" },
  { slug: "bella-vista", name: "Bella Vista" },
  { slug: "kellyville", name: "Kellyville" },
  { slug: "north-rocks", name: "North Rocks" },
  { slug: "winston-hills", name: "Winston Hills" },
  { slug: "northmead", name: "Northmead" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/[0.06] mt-auto">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/images/logo.png" alt="Obsidian Volleyball Academy" width={36} height={36} className="w-9 h-9" />
              <span className="font-heading text-2xl text-white tracking-[0.08em]">
                OBSIDIAN<span className="text-[#9B4FDE]"> VOLLEYBALL</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
              Premium junior volleyball academy across Sydney.
              Established 2025.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/obsidianvolleyball"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-[#9B4FDE] transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="mailto:obsidianvolleyball@gmail.com"
                className="text-gray-600 hover:text-[#9B4FDE] transition-colors duration-300"
                aria-label="Email"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">NAVIGATE</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/term-programs", label: "Junior Classes" },
                { href: "/adult-sessions", label: "Adult Sessions" },
                { href: "/holiday-camp", label: "Holiday Camps" },
                { href: "/coaches", label: "Coaches" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-white text-sm transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">VENUES</h3>
            <ul className="not-italic text-gray-600 text-sm space-y-2 mb-6">
              <li>
                <Link
                  href="/west-ryde"
                  className="text-gray-400 hover:text-[#9B4FDE] transition-colors duration-300"
                >
                  Bennelong Sports Centre
                </Link>
              </li>
              <li>West Ryde, NSW (term programs)</li>
              <li className="pt-2">
                <Link
                  href="/baulkham-hills"
                  className="text-gray-400 hover:text-[#9B4FDE] transition-colors duration-300"
                >
                  Baulkham Hills High School
                </Link>
              </li>
              <li>Baulkham Hills, NSW (holiday camps)</li>
            </ul>
            <Link
              href="/areas"
              className="inline-block text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors duration-300"
            >
              All service areas &rarr;
            </Link>
          </div>
        </div>

        {/* Service areas — Ryde cluster */}
        <div className="mt-12 pt-8 border-t border-white/[0.04]">
          <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">
            TERM PROGRAMS &middot; WEST RYDE CATCHMENT
          </h3>
          <p className="text-gray-700 text-xs mb-4">Friday classes for families from:</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {rydeAreas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="text-gray-600 hover:text-[#9B4FDE] text-sm transition-colors duration-300"
                >
                  Volleyball {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Service areas — Hills cluster */}
        <div className="mt-10 pt-6 border-t border-white/[0.04]">
          <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">
            HOLIDAY CAMPS &middot; HILLS DISTRICT CATCHMENT
          </h3>
          <p className="text-gray-700 text-xs mb-4">School-holiday camps for families from:</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {hillsAreas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="text-gray-600 hover:text-[#9B4FDE] text-sm transition-colors duration-300"
                >
                  Volleyball {area.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-700 text-xs">
            &copy; {new Date().getFullYear()} Obsidian Volleyball Academy
          </p>
          <div className="flex items-center gap-4 text-gray-700 text-xs">
            <Link href="/privacy" className="hover:text-[#9B4FDE] transition-colors">
              Privacy Policy
            </Link>
            <span>Sydney, Australia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
