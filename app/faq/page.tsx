import type { Metadata } from "next";
import SectionReveal from "@/components/SectionReveal";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Obsidian Volleyball Academy Baulkham Hills",
  description:
    "Frequently asked questions about Obsidian Volleyball Academy. Programs, pricing, age groups, and more.",
};

const faqCategories = [
  {
    category: "PROGRAMS & BOOKING",
    faqs: [
      {
        q: "What programs do you offer?",
        a: "We run holiday camps during school holiday periods and term programs during the school year. Programs are available for beginner, intermediate, and advanced skill levels, catering to juniors aged 8 to 18.",
      },
      {
        q: "How do I book a session?",
        a: "Book directly through our Acuity scheduling page. Select your preferred program and time slot, and pay securely online. You'll receive a confirmation email with all the details.",
      },
      {
        q: "Can I book a single day or do I need to book the full camp?",
        a: "Both options are available. We offer full camp packages (best value, includes a free shirt) as well as individual day bookings and half-day sessions. Check the booking page for current options.",
      },
      {
        q: "How much does it cost?",
        a: "A 5-day holiday camp package is $200 and includes a free OVA shirt. Individual day rates and half-day rates are also available. Check the booking page for current pricing.",
      },
      {
        q: "Do you run programs during school terms?",
        a: "Yes. We run weekly term programs during the school year in addition to our holiday camps. Check the booking page for current term program schedules.",
      },
    ],
  },
  {
    category: "PAYMENTS",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept credit/debit cards through our secure Stripe payment system. Payment is processed at the time of booking.",
      },
      {
        q: "What is your refund policy?",
        a: "Contact us at obsidianvolleyball@gmail.com for refund enquiries. We handle refunds on a case-by-case basis and aim to be fair and flexible.",
      },
    ],
  },
  {
    category: "PLAYERS & SKILL LEVELS",
    faqs: [
      {
        q: "What age groups do you cater for?",
        a: "We run programs for juniors aged 8 to 18. Players are grouped by skill level rather than age alone, so everyone trains at the right intensity.",
      },
      {
        q: "My child has never played volleyball. Is that OK?",
        a: "Absolutely. Our Beginner Blast program is specifically designed for kids with zero experience. Coaches are trained to make it fun and non-intimidating from session one.",
      },
      {
        q: "How do you group players?",
        a: "By skill level, not just age. We assess players at the start and place them in the appropriate group, so beginners aren't overwhelmed and advanced players are appropriately challenged.",
      },
      {
        q: "Is there a pathway to competitive volleyball?",
        a: "Yes. Our Elite Program prepares advanced juniors for club and representative volleyball. Talk to our coaches about your child's development goals.",
      },
    ],
  },
  {
    category: "VENUE & LOGISTICS",
    faqs: [
      {
        q: "Where are the camps held?",
        a: "All sessions are at Baulkham Hills High School in the Hills District of Sydney. The venue has multiple indoor courts, so sessions run rain or shine.",
      },
      {
        q: "Is there parking available?",
        a: "Yes, free on-site parking. Enter via the school main entrance and follow signs to the sports hall.",
      },
      {
        q: "What should my child bring?",
        a: "Sports shoes (clean, non-marking soles), a large water bottle, lunch and snacks for full-day camps, and sunscreen for any outdoor warm-ups.",
      },
      {
        q: "What time do sessions start and end?",
        a: "Full-day camps run 9AM to 1PM with half-day options available. Exact times are confirmed on the booking page for each program.",
      },
    ],
  },
  {
    category: "COACHES & SAFETY",
    faqs: [
      {
        q: "Are your coaches qualified?",
        a: "All OVA coaches are accredited and hold current Working With Children Checks (WWCC). They bring competitive playing experience alongside their coaching credentials.",
      },
      {
        q: "What is the coach-to-player ratio?",
        a: "We maintain small group sizes to ensure each player receives meaningful coaching attention. Specific ratios vary by program level.",
      },
    ],
  },
];

export default function FAQPage() {
  // Flatten all FAQs for structured data
  const allFaqs = faqCategories.flatMap((c) => c.faqs);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  return (
    <div className="pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Hero */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">ANSWERS</p>
            <h1 className="font-heading text-6xl sm:text-8xl lg:text-9xl text-white tracking-wide mb-8 leading-[0.9]">
              FREQUENTLY
              <br />
              ASKED
              <br />
              <span className="text-[#9B4FDE]">QUESTIONS</span>
            </h1>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ Categories */}
      {faqCategories.map((category, catIndex) => (
        <section
          key={category.category}
          className={`py-16 lg:py-20 ${catIndex % 2 === 0 ? "bg-[#111]" : "bg-[#0A0A0A]"}`}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionReveal>
              <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.4em] mb-8 pb-4 border-b border-white/[0.06]">
                {category.category}
              </p>
            </SectionReveal>
            <div className="space-y-0">
              {category.faqs.map((faq, i) => (
                <SectionReveal key={i} delay={i * 0.03}>
                  <details className="group border-b border-white/[0.06]">
                    <summary className="flex justify-between items-center py-5 cursor-pointer list-none select-none">
                      <span className="font-heading text-lg sm:text-xl text-white tracking-wide pr-4 group-hover:text-[#9B4FDE] transition-colors duration-300">
                        {faq.q}
                      </span>
                      <span className="text-gray-600 flex-shrink-0 text-sm font-heading tracking-widest group-open:text-[#9B4FDE] transition-colors">
                        +
                      </span>
                    </summary>
                    <div className="pb-5 text-gray-500 text-sm leading-relaxed pl-0">{faq.a}</div>
                  </details>
                </SectionReveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Still have questions */}
      <section className="py-24 lg:py-32 bg-[#0A0A0A] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">STILL HAVE QUESTIONS?</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-6">
              WE&apos;RE HERE
              <br />
              TO <span className="text-[#9B4FDE]">HELP</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              Email us or send a DM on Instagram. We respond quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:obsidianvolleyball@gmail.com"
                className="bg-[#7B2FBE] text-white font-heading text-xl px-10 py-4 hover:bg-white transition-all duration-300 tracking-wide glow-purple"
              >
                EMAIL US
              </a>
              <Link
                href="/contact"
                className="border border-white/20 text-white font-heading text-xl px-10 py-4 hover:border-[#9B4FDE] hover:text-[#9B4FDE] transition-all duration-300 tracking-wide"
              >
                ALL CONTACT OPTIONS
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
