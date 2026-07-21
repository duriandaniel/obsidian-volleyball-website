import type { Metadata } from "next";
import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";
import CopyEmail from "@/components/CopyEmail";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Obsidian Volleyball Academy. Programs, pricing, venues across Sydney, age groups, the competitive pathway, and more.",
  alternates: { canonical: "/faq" },
};

const faqCategories = [
  {
    title: "Getting started",
    faqs: [
      {
        q: "What programs do you offer?",
        a: "We run holiday camps during school holiday periods and weekly training during the school year. Programs cater to juniors aged 8 to 18 across beginner, intermediate, and advanced skill levels.",
      },
      {
        q: "How do I book?",
        a: "Book online at obsidianvolleyball.com/booking. Choose your program and days, pay securely, and you'll get a confirmation email with all the details.",
      },
      {
        q: "Can my child try a class first?",
        a: "Yes. New players can book a Trial Class: one session of any junior weekly class for $25, so you can try before committing to the term. Limit one trial per player. Book it from the booking page.",
      },
    ],
  },
  {
    title: "Pricing",
    faqs: [
      {
        q: "How much do holiday camps cost?",
        a: "Full days are $70 each. The 5-day pass is $250 for any five days across the holiday period, which is our best value and works out cheaper than four single days. Half-day sessions (9 to 11 AM) are $45. You can also add an Obsidian training jersey for $36 at checkout. Pick your days on the booking page and the total updates as you go.",
      },
      {
        q: "How much is weekly training — term vs casual?",
        a: "Enrol for the full term and it's $36 per class, paid upfront for the remaining weeks of the term — the best value. Prefer to come casually? Drop in to any class for $40. A one-off trial class is $25. Booking the term saves you $4 every class.",
      },
      {
        q: "What if my child misses a week?",
        a: "Term enrolments aren't refunded week to week. If your child has to miss a session, contact us and we'll offer a makeup at another class or day where we can. If you need real week-to-week flexibility, that's exactly what the casual drop-in rate is for.",
      },
    ],
  },
  {
    title: "Players & skill levels",
    faqs: [
      {
        q: "What age groups do you cater for?",
        a: "We run programs for juniors aged 8 to 18. Players are grouped by skill level rather than age alone, so everyone trains at the right intensity.",
      },
      {
        q: "My child has never played volleyball. Is that OK?",
        a: "Absolutely. Our beginner sessions are designed for kids with zero experience, and our coaches make it fun and welcoming from day one. During camp, coaches also move players up or down a level so everyone stays challenged and engaged.",
      },
      {
        q: "How do you group players?",
        a: "By skill level, not just age. We assess players and place them in the right group, so beginners aren't overwhelmed and advanced players are properly challenged.",
      },
    ],
  },
  {
    title: "Pathway & competition",
    faqs: [
      {
        q: "Is there a pathway to competitive volleyball?",
        a: "Yes. Players are grouped by ability so stronger players are always pushed, and our advanced sessions build toward representative and club volleyball. From 2027 we're entering junior teams into the Sydney Volleyball League, giving our players a clear competitive pathway.",
      },
      {
        q: "Can my child play in a competitive team?",
        a: "From 2027 we're fielding junior teams in the Sydney Volleyball League. If your child is keen to compete, let our coaches know and we'll guide the next steps as teams take shape.",
      },
    ],
  },
  {
    title: "Venues & logistics",
    faqs: [
      {
        q: "Where do you run programs?",
        a: "Weekly training runs at Obsidian Volleyball Academy West Ryde (Friday evenings) and Obsidian Volleyball Academy Kellyville at Kellyville High School (Tuesday and Wednesday afternoons). Holiday camps run at Baulkham Hills High School during school holiday periods.",
      },
      {
        q: "Are the venues indoor?",
        a: "Yes. Every venue we run from has indoor courts, so sessions run rain or shine.",
      },
      {
        q: "Is there parking available?",
        a: "Free on-site or nearby parking is available at all venues. Specific parking instructions are sent in your booking confirmation.",
      },
      {
        q: "What should my child bring?",
        a: "Suitable indoor court shoes, a water bottle (refill stations are on site), and their Obsidian Volleyball training jersey. We provide all volleyball gear.",
      },
      {
        q: "What time do sessions start and end?",
        a: "Weekly training runs in 1.5-hour blocks: West Ryde on Friday evenings (4:00 PM and 5:30 PM starts) and Kellyville on Tuesday and Wednesday afternoons (4:00 PM start). Holiday camps run 9 AM to 1 PM (full day), with half-day options from 9 to 11 AM. Adult scrims run Friday 7:00 to 9:00 PM at West Ryde.",
      },
    ],
  },
  {
    title: "Payments & refunds",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept credit and debit cards through our secure Stripe payment system. Payment is processed at the time of booking.",
      },
      {
        q: "What is your refund and reschedule policy?",
        a: "In short: cancel a camp 7+ days before it starts for a full refund; 3–6 days before we'll move you to another available camp day free instead; inside 3 days there's no refund (unless we can fill your spot from the waitlist). Term programs are fully refundable before the term starts; once it's underway, missed weeks get make-ups where space allows rather than refunds. Illness or injury with a doctor's certificate is always refunded pro-rata, even same-day. Adult social sessions are non-refundable. The full policy, in plain English, is on our Cancellation & Refund Policy page at obsidianvolleyball.com/refund-policy.",
        href: "/refund-policy",
        linkLabel: "Read the full cancellation & refund policy",
      },
    ],
  },
  {
    title: "Coaches & safety",
    faqs: [
      {
        q: "Are your coaches qualified?",
        a: "All Obsidian coaches are accredited and hold current Working With Children Checks. They bring competitive playing experience alongside their coaching credentials.",
      },
      {
        q: "What is the coach-to-player ratio?",
        a: "We keep group sizes small so every player gets meaningful coaching attention. Specific ratios vary by program level.",
      },
    ],
  },
];

export default function FAQPage() {
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
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">ANSWERS</p>
            <h1 className="font-heading text-6xl sm:text-7xl lg:text-8xl text-white tracking-wide mb-6 leading-[0.95]">
              FREQUENTLY ASKED
              <br />
              <span className="text-[#7E57C2]">QUESTIONS</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              Everything about our camps, classes, pricing, and pathway. Can&apos;t find your answer? Reach out below.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-8 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {faqCategories.map((category) => (
            <SectionReveal key={category.title}>
              <div>
                <h2 className="font-heading text-2xl lg:text-3xl text-white tracking-wide mb-6 pb-3 border-b border-[#7E57C2]/30">
                  {category.title}
                </h2>
                <div className="divide-y divide-white/[0.06]">
                  {category.faqs.map((faq) => (
                    <details key={faq.q} className="group">
                      <summary className="flex justify-between items-center gap-4 py-5 cursor-pointer list-none select-none">
                        <span className="text-lg text-white font-medium leading-snug group-hover:text-[#7E57C2] transition-colors duration-300">
                          {faq.q}
                        </span>
                        <span className="text-[#7E57C2] flex-shrink-0 text-2xl leading-none transition-transform duration-300 group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <div className="pb-5 -mt-1 text-gray-400 text-base leading-relaxed max-w-2xl">
                        {faq.a}
                        {"href" in faq && faq.href && (
                          <>
                            {" "}
                            <Link href={faq.href} className="text-[#7E57C2] hover:underline">
                              {faq.linkLabel ?? "Read more"}
                            </Link>
                          </>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-24 lg:py-32 bg-[#111] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <SectionReveal>
            <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-4">STILL HAVE QUESTIONS?</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide mb-6">
              WE&apos;RE HERE
              <br />
              TO <span className="text-[#7E57C2]">HELP</span>
            </h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Copy our email or send a DM on Instagram. We respond quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CopyEmail
                copiedLabel="COPIED TO CLIPBOARD ✓"
                className="bg-[#5E35A8] text-white font-heading text-xl px-10 py-4 hover:bg-white hover:text-[#5E35A8] transition-all duration-300 tracking-wide glow-purple"
              >
                COPY OUR EMAIL
              </CopyEmail>
              <a
                href="https://instagram.com/obsidianvolleyball"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 text-white font-heading text-xl px-10 py-4 hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300 tracking-wide"
              >
                MESSAGE ON INSTAGRAM
              </a>
            </div>
            <p className="text-gray-600 text-sm mt-6">obsidianvolleyball@gmail.com</p>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}
