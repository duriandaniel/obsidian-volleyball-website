import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";

export const metadata: Metadata = {
  title: "Contact | Obsidian Volleyball Academy Sydney",
  description:
    "Get in touch with Obsidian Volleyball Academy. Term programs in West Ryde, holiday camps in Baulkham Hills. Email, Instagram, or book directly.",
  alternates: { canonical: "/contact" },
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
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">GET IN TOUCH</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              CONTACT
              <br />
              <span className="text-[#9B4FDE]">US</span>
            </h1>
            <p className="text-gray-400 text-xl max-w-xl leading-relaxed">
              Questions about programs or pricing?
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
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-white/[0.06] hover:border-[#9B4FDE]/20 transition-all duration-500"
                >
                  <div>
                    <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-2">{method.label}</p>
                    <p className="font-heading text-3xl sm:text-4xl text-white group-hover:text-[#9B4FDE] transition-colors duration-300 mb-2">
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
                      className="text-gray-700 group-hover:text-[#9B4FDE] transition-colors duration-300"
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

    </div>
  );
}
