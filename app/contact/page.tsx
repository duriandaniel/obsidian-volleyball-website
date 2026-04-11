import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";

export const metadata: Metadata = {
  title: "Contact | Obsidian Volleyball Academy Baulkham Hills",
  description:
    "Get in touch with Obsidian Volleyball Academy. Located at Baulkham Hills High School, Hills District Sydney. Email, Instagram, or book directly.",
};

const contactMethods = [
  {
    label: "EMAIL",
    value: "obsidianvolleyball@gmail.com",
    href: "mailto:obsidianvolleyball@gmail.com",
    description: "Best for general enquiries and booking questions",
  },
  {
    label: "INSTAGRAM",
    value: "@obsidianvolleyball",
    href: "https://instagram.com/obsidianvolleyball",
    description: "DM us for quick questions or follow for updates",
  },
  {
    label: "BOOK DIRECTLY",
    value: "obsidianvolleyball.as.me",
    href: "https://obsidianvolleyball.as.me",
    description: "Browse programs and book a session instantly",
  },
];

export default function ContactPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-6">GET IN TOUCH</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              CONTACT
              <br />
              <span className="text-[#00FF88]">US</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-xl leading-relaxed">
              Questions about programs, pricing, or Active Kids Vouchers?
              We&apos;re here to help.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-24 lg:py-32 bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-0">
            {contactMethods.map((method, i) => (
              <SectionReveal key={method.label} delay={i * 0.08}>
                <a
                  href={method.href}
                  target={method.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={method.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-white/[0.06] hover:border-[#00FF88]/20 transition-all duration-500"
                >
                  <div>
                    <p className="text-[#00FF88] font-heading text-xs tracking-[0.3em] mb-2">{method.label}</p>
                    <p className="font-heading text-3xl sm:text-4xl text-white group-hover:text-[#00FF88] transition-colors duration-300 mb-2">
                      {method.value}
                    </p>
                    <p className="text-gray-600 text-sm">{method.description}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex-shrink-0">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-gray-700 group-hover:text-[#00FF88] transition-colors duration-300"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>
                </a>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Location + Map */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-12">
            <SectionReveal>
              <div>
                <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-3">TRAINING VENUE</p>
                <h2 className="font-heading text-4xl lg:text-5xl text-white tracking-wide mb-8">LOCATION</h2>
                <address className="not-italic space-y-3 mb-8">
                  <p className="text-white text-lg">Baulkham Hills High School</p>
                  <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills</p>
                  <p className="text-gray-500 text-sm">NSW 2153, Australia</p>
                </address>
                <div className="border-t border-white/[0.06] pt-6 mb-8">
                  <h3 className="font-heading text-lg text-white mb-3 tracking-wide">NEARBY SUBURBS</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Castle Hill, Kellyville, Cherrybrook, Bella Vista,
                    Winston Hills, Northmead, North Rocks, Carlingford,
                    West Pennant Hills, Dural
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=Baulkham+Hills+High+School"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#00FF88] text-sm font-medium hover:text-white transition-colors"
                >
                  Get directions
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              </div>
            </SectionReveal>
            <SectionReveal delay={0.15}>
              <div className="aspect-[16/10] lg:aspect-auto lg:h-full min-h-[400px] overflow-hidden bg-[#111]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3315.3!2d150.9927!3d-33.7627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b129838f39a743f%3A0x3017d681632a850!2sBaulkham%20Hills%20High%20School!5e0!3m2!1sen!2sau!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Baulkham Hills High School location"
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
            <p className="text-[#00FF88] font-heading text-sm tracking-[0.4em] mb-4">READY TO TRAIN?</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-8">BOOK A SESSION</h2>
            <a
              href={process.env.NEXT_PUBLIC_ACUITY_URL || "https://obsidianvolleyball.as.me"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#00FF88] text-black font-heading text-2xl px-12 py-4 hover:bg-white transition-all duration-300 tracking-wide glow-green"
            >
              BOOK NOW
            </a>
            <p className="text-gray-700 text-xs mt-6 tracking-wider">
              ACTIVE KIDS VOUCHERS ACCEPTED &middot; ALL SKILL LEVELS
            </p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
