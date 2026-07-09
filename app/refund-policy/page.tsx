import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description:
    "How cancellations, refunds, and credits work for Obsidian Volleyball Academy holiday camps and term programs.",
  alternates: { canonical: "/refund-policy" },
};

// The single source of truth for our cancellation rules, replacing the old
// "case by case" wording. Warm but firm: the "why" (capped spots, rostered
// coaches, waitlisted families) is stated up front so the rules read as fair.
const CAMP_TIERS = [
  { when: "7 or more days before your first camp day", what: "Full refund, or a credit — your choice" },
  { when: "3 to 6 days before", what: "Credit (valid 12 months) — no cash refund" },
  { when: "Less than 3 days, same-day, or no-show", what: "No refund or credit" },
];

export default function RefundPolicyPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0A0A0A]">
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-6">THE FINE PRINT, IN PLAIN ENGLISH</p>
          <h1 className="font-heading text-5xl sm:text-7xl text-white tracking-wide mb-10 leading-[0.9]">
            CANCELLATION &amp;
            <br />
            <span className="text-[#7E57C2]">REFUND POLICY</span>
          </h1>

          <div className="space-y-10 text-gray-400 text-base leading-relaxed">
            <p>
              We want camp and term to be great for every family — and part of that is being upfront
              about how cancellations work, so there are never any surprises. Our camps and classes are
              capped, coaches are rostered ahead of time, and kids on the waitlist miss out when a booked
              spot goes unused. That&apos;s what shapes the rules below.
            </p>

            {/* Holiday camps */}
            <div>
              <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">
                HOLIDAY CAMPS
              </h2>
              <div className="border border-white/10 rounded-lg overflow-hidden mb-4">
                {CAMP_TIERS.map((tier, i) => (
                  <div
                    key={tier.when}
                    className={`grid grid-cols-1 sm:grid-cols-2 ${i > 0 ? "border-t border-white/10" : ""}`}
                  >
                    <div className="px-4 py-3 text-sm text-gray-300 sm:border-r border-white/10 bg-white/[0.03]">
                      {tier.when}
                    </div>
                    <div className="px-4 py-3 text-sm text-white">{tier.what}</div>
                  </div>
                ))}
              </div>
              <p className="mb-3">Credits can be put toward any future Obsidian camp or program.</p>
              <p className="mb-3">
                One extra out, even at late notice: if you cancel inside 3 days and we&apos;re able to fill
                your child&apos;s spot from the waitlist, we&apos;ll refund you — no one loses out that way.
              </p>
              <p className="text-gray-500 text-sm">
                <span className="text-gray-300 font-medium">Why the cutoffs?</span> By the final days before
                camp we&apos;ve locked in coaches, courts, and numbers based on your booking — and it&apos;s
                usually too late for a waitlisted family to rearrange their week and take the spot.
              </p>
            </div>

            {/* Term programs */}
            <div>
              <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">
                TERM PROGRAMS
              </h2>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-[#7E57C2] flex-shrink-0">+</span>
                  <span>
                    <strong className="text-white">Cancelling before the term starts (7+ days notice):</strong>{" "}
                    full refund or credit — your choice.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#7E57C2] flex-shrink-0">+</span>
                  <span>
                    <strong className="text-white">Cancelling before the term starts (less than 7 days):</strong>{" "}
                    credit, valid 12 months.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#7E57C2] flex-shrink-0">+</span>
                  <span>
                    <strong className="text-white">Once the term has started:</strong> no refunds for change of
                    mind or general non-attendance. Your enrolment holds your child&apos;s place in that class
                    for the whole term, and we plan coaching and numbers around it.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#7E57C2] flex-shrink-0">+</span>
                  <span>
                    <strong className="text-white">Missed sessions:</strong> individual missed weeks aren&apos;t
                    refundable, but message us — we&apos;ll offer a make-up at another class or day where space
                    allows. If your schedule genuinely changes week to week, our casual drop-in rate exists for
                    exactly that.
                  </span>
                </li>
              </ul>
            </div>

            {/* Medical */}
            <div>
              <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">
                ILLNESS &amp; INJURY
              </h2>
              <p className="mb-3">Kids get sick and injuries happen — we&apos;ll always look after you here.</p>
              <p>
                If your child can&apos;t attend, or can&apos;t continue, because of illness or injury,
                we&apos;ll give you a credit for the unused days or sessions (pro-rata for a part-completed
                term or camp) on receipt of a doctor&apos;s certificate. This applies at any time — including
                same-day.
              </p>
            </div>

            {/* If we cancel */}
            <div>
              <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">
                IF WE CANCEL
              </h2>
              <p>
                If we ever have to cancel a day or session, you&apos;ll get a full refund for it — no
                conditions.
              </p>
            </div>

            {/* How to request */}
            <div>
              <h2 className="font-heading text-2xl text-white tracking-wide mb-4 pb-3 border-b border-[#7E57C2]/30">
                HOW TO REQUEST A CANCELLATION
              </h2>
              <p className="mb-3">
                Email us at{" "}
                <a
                  href="mailto:obsidianvolleyball@gmail.com"
                  className="text-[#7E57C2] hover:text-white transition-colors"
                >
                  obsidianvolleyball@gmail.com
                </a>{" "}
                with:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-400 mb-3">
                <li>Your child&apos;s name</li>
                <li>The camp days or term program you booked</li>
                <li>The reason (attach a doctor&apos;s certificate for medical cancellations)</li>
              </ol>
              <p>
                We&apos;ll confirm within 2 business days. Refunds go back to the card you paid with; credits
                are recorded against your family and applied at your next booking.
              </p>
            </div>

            <p className="text-gray-500 text-sm">Adult social sessions are non-refundable and non-transferable.</p>

            <p>
              Questions, or a situation that doesn&apos;t fit neatly above?{" "}
              <Link href="/contact" className="text-[#7E57C2] hover:text-white transition-colors">
                Just reach out
              </Link>{" "}
              — we&apos;d rather talk it through than have you guess.
            </p>

            <div className="border-t border-white/[0.06] pt-6">
              <p className="text-gray-600 text-xs">Last updated: 9 July 2026</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
