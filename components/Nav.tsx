"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TrackedBookingLink from "./TrackedBookingLink";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/term-programs", label: "Junior Classes" },
  { href: "/holiday-camp", label: "Holiday Camps" },
  { href: "/adult-sessions", label: "Adults" },
  { href: "/coaches", label: "Coaches" },
  { href: "/faq", label: "FAQ" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide marketing nav on admin and booking app routes (they render their own nav)
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/booking/portal")) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header
        className={`fixed top-10 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || mobileOpen
            ? "bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link
              href="/"
              onClick={closeMenu}
              className="flex items-center gap-2 group"
            >
              <Image
                src="/images/logo.png"
                alt="Obsidian Volleyball Academy"
                width={40}
                height={40}
                className="w-9 h-9 lg:w-10 lg:h-10"
              />
              <span className="font-heading text-xl lg:text-2xl text-white tracking-[0.08em]">
                OBSIDIAN<span className="text-[#7E57C2]"> VOLLEYBALL</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-[13px] font-medium tracking-widest uppercase transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:block">
              <TrackedBookingLink
                location="nav"
                className="bg-[#5E35A8] text-white font-heading text-lg px-6 py-2.5 hover:bg-white transition-colors duration-300 tracking-wide"
              >
                BOOK NOW
              </TrackedBookingLink>
            </div>

            <button
              type="button"
              className="lg:hidden p-2 -mr-2"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between items-end">
                <span
                  className={`block h-[2px] bg-white transition-all duration-300 ${
                    mobileOpen ? "w-6 rotate-45 translate-y-[9px]" : "w-6"
                  }`}
                />
                <span
                  className={`block h-[2px] bg-white transition-all duration-300 ${
                    mobileOpen ? "w-0 opacity-0" : "w-4"
                  }`}
                />
                <span
                  className={`block h-[2px] bg-white transition-all duration-300 ${
                    mobileOpen ? "w-6 -rotate-45 -translate-y-[9px]" : "w-5"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-40 bg-[#0A0A0A] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-3 pt-16">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="font-heading text-3xl sm:text-4xl text-white hover:text-[#7E57C2] tracking-wider transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6">
            <TrackedBookingLink
              location="nav_mobile"
              onClick={closeMenu}
              className="bg-[#5E35A8] text-white font-heading text-2xl px-10 py-4 tracking-wide glow-purple block"
            >
              BOOK NOW
            </TrackedBookingLink>
          </div>
        </nav>
      </div>
    </>
  );
}
