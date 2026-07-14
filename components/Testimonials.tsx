import Link from "next/link";
import SectionReveal from "@/components/SectionReveal";

// Real reviews supplied by OVA. Attribution kept generic (Parent/Player) by
// request. Only obvious spelling/typos were corrected; wording preserved.
type Review = { name: string; text: string; stars: number };

const REVIEWS: Review[] = [
  {
    name: "Parent",
    stars: 5,
    text: "If you're looking for a program that truly develops your child both on and off the court, Obsidian is something special. Highly recommended for kids who want more than just a sport but a meaningful journey for volleyball training.",
  },
  {
    name: "Parent",
    stars: 5,
    text: "Best volleyball camp during the school holidays. My boy enjoyed it so much and his skills improved a lot with 5 days training.",
  },
  {
    name: "Parent",
    stars: 5,
    text: "Obsidian Volleyball has benefited my daughter in a variety of ways. They advocate for youth and prioritise players' health and wellbeing, and adjust their training based on the child. My daughter has improved significantly since she started Obsidian. Lauren is a great trainer who shows her dedication for volleyball through teaching the youth. I'm glad that my daughter loves coming to Obsidian and that she is in good hands.",
  },
  {
    name: "Player",
    stars: 5,
    text: "Coaches are super approachable, good consistent focus on the details of the sport and it's run really well by all their coaches.",
  },
];

const GOOGLE_REVIEWS_URL =
  "https://www.google.com/search?q=Obsidian+Volleyball+Academy+reviews";

export default function Testimonials() {
  if (!REVIEWS.length) return null;
  return (
    <section className="py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16">
            <div>
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">FROM OUR FAMILIES</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">REVIEWS</h2>
            </div>
            <Link
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 lg:mt-0 text-gray-500 hover:text-[#7E57C2] text-sm flex items-center gap-2 transition-colors"
            >
              Read our reviews on Google
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-14">
          {REVIEWS.map((r, i) => (
            <SectionReveal key={i} delay={(i % 2) * 0.1}>
              <figure className="border-l-2 border-[#7E57C2]/40 pl-6">
                <div className="text-[#7E57C2] text-sm tracking-[0.3em] mb-4" aria-label={`${r.stars} out of 5`}>
                  {"★".repeat(r.stars)}
                </div>
                <blockquote className="text-gray-400 leading-relaxed">{r.text}</blockquote>
                <figcaption className="mt-5 text-white font-heading tracking-wide text-sm">
                  {r.name}
                </figcaption>
              </figure>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
