import Link from "next/link";
import Image from "next/image";
import TrackedBookingLink from "./TrackedBookingLink";

const serviceAreas = [
  { slug: "castle-hill", name: "Castle Hill" },
  { slug: "kellyville", name: "Kellyville" },
  { slug: "cherrybrook", name: "Cherrybrook" },
  { slug: "bella-vista", name: "Bella Vista" },
  { slug: "winston-hills", name: "Winston Hills" },
  { slug: "northmead", name: "Northmead" },
  { slug: "carlingford", name: "Carlingford" },
  { slug: "west-pennant-hills", name: "West Pennant Hills" },
  { slug: "dural", name: "Dural" },
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
              Premium junior volleyball academy in the Hills District of Sydney.
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
                { href: "/holiday-camp", label: "Holiday Camps" },
                { href: "/term-programs", label: "Term Programs" },
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
            <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">VENUE</h3>
            <address className="not-italic text-gray-600 text-sm space-y-2 mb-6">
              <p className="text-gray-400">Baulkham Hills High School</p>
              <p>Baulkham Hills, NSW 2153</p>
              <p>Hills District, Sydney</p>
            </address>
            <TrackedBookingLink
              location="footer"
              className="inline-block text-[#9B4FDE] text-sm font-medium hover:text-white transition-colors duration-300"
            >
              Book a session &rarr;
            </TrackedBookingLink>
          </div>
        </div>

        {/* Service areas */}
        <div className="mt-12 pt-8 border-t border-white/[0.04]">
          <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">SERVICE AREAS</h3>
          <p className="text-gray-700 text-xs mb-4">Junior volleyball coaching across the Hills District:</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {serviceAreas.map((area) => (
              <li key={area.slug}>
                <Link
                  href={`/areas/${area.slug}`}
                  className="text-gray-600 hover:text-[#9B4FDE] text-sm transition-colors duration-300"
                >
                  Volleyball {area.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/areas"
                className="text-gray-500 hover:text-[#9B4FDE] text-sm transition-colors duration-300"
              >
                All areas &rarr;
              </Link>
            </li>
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
            <span>Hills District, Sydney</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
