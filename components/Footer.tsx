"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import CopyEmail from "./CopyEmail";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/booking/portal")) return null;
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
                OBSIDIAN<span className="text-[#7E57C2]"> VOLLEYBALL</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-6">
              Quality junior volleyball academy across Sydney.
            </p>
            <div className="space-y-3">
              <a
                href="https://instagram.com/obsidianvolleyball"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-gray-400 hover:text-[#7E57C2] transition-colors duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 group-hover:text-[#7E57C2] transition-colors">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-sm">@obsidianvolleyball</span>
              </a>
              <CopyEmail
                copiedLabel="Email copied to clipboard!"
                className="group inline-flex items-center gap-3 text-gray-400 hover:text-[#7E57C2] transition-colors duration-300 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 group-hover:text-[#7E57C2] transition-colors">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-10 7L2 7" />
                </svg>
                <span className="text-sm">obsidianvolleyball@gmail.com</span>
              </CopyEmail>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading text-base text-gray-400 mb-4 tracking-[0.2em]">NAVIGATE</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/term-programs", label: "Weekly Training" },
                { href: "/adult-sessions", label: "Adults" },
                { href: "/holiday-camp", label: "Holiday Camps" },
                { href: "/coaches", label: "Coaches" },
                { href: "/shop/jersey", label: "Jersey" },
                { href: "/faq", label: "FAQ" },
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
              <li className="text-gray-400">Obsidian Volleyball Academy West Ryde</li>
              <li>West Ryde, NSW (weekly training)</li>
              <li className="pt-2 text-gray-400">Obsidian Volleyball Academy Kellyville</li>
              <li>Kellyville, NSW (weekly training)</li>
              <li className="pt-2 text-gray-400">Baulkham Hills High School</li>
              <li>Baulkham Hills, NSW (holiday camps)</li>
            </ul>
            <Link
              href="/areas"
              className="inline-block text-[#7E57C2] text-sm font-medium hover:text-white transition-colors duration-300"
            >
              All service areas &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-700 text-xs">
            &copy; {new Date().getFullYear()} Obsidian Volleyball Academy
          </p>
          <div className="flex items-center gap-4 text-gray-700 text-xs">
            <Link href="/refund-policy" className="hover:text-[#7E57C2] transition-colors">
              Refund Policy
            </Link>
            <Link href="/privacy" className="hover:text-[#7E57C2] transition-colors">
              Privacy Policy
            </Link>
            <span>Sydney, Australia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
