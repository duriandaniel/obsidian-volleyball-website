import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Obsidian Volleyball Academy website.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0A0A0A]">
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-6">LEGAL</p>
          <h1 className="font-heading text-5xl sm:text-7xl text-white tracking-wide mb-12 leading-[0.9]">
            PRIVACY
            <br />
            <span className="text-[#9B4FDE]">POLICY</span>
          </h1>

          <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">OVERVIEW</h2>
              <p>
                Obsidian Volleyball Academy (&ldquo;OVA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy.
                This policy explains how we collect, use, and protect information when you visit our website.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">INFORMATION WE COLLECT</h2>
              <p className="mb-3">When you visit our website, we may collect:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>Page views and navigation patterns (via Google Analytics)</li>
                <li>Device type, browser, and general location (city-level)</li>
                <li>Interactions with buttons and links (e.g. booking clicks)</li>
                <li>Information you voluntarily provide when booking through Acuity Scheduling</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">COOKIES & TRACKING</h2>
              <p className="mb-3">We use the following technologies:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li><strong className="text-gray-300">Google Analytics 4</strong>: measures website traffic and usage patterns</li>
                <li><strong className="text-gray-300">Google Tag Manager</strong>: manages our analytics and advertising tags</li>
                <li><strong className="text-gray-300">Meta Pixel</strong>: measures the effectiveness of our Facebook and Instagram advertising</li>
              </ul>
              <p className="mt-3">
                You can manage your cookie preferences using the consent banner shown when you first visit the site.
                You can also clear cookies in your browser settings at any time.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">HOW WE USE YOUR INFORMATION</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>To understand how visitors use our website and improve it</li>
                <li>To measure the performance of our advertising campaigns</li>
                <li>To show relevant ads to people who have visited our website</li>
                <li>To process bookings and communicate about programs</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">THIRD PARTIES</h2>
              <p>
                We share data with Google (Analytics, Ads) and Meta (Facebook, Instagram) for analytics and advertising purposes.
                These services have their own privacy policies. Booking data is processed by Acuity Scheduling and Stripe
                for payment processing.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">CHILDREN&apos;S PRIVACY</h2>
              <p>
                Our programs serve juniors aged 8&ndash;18. We do not knowingly collect personal information from children
                through our website. Bookings are made by parents or guardians. If you believe a child has submitted
                personal information, please contact us.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">YOUR RIGHTS</h2>
              <p>
                Under Australian privacy law, you have the right to access, correct, or request deletion of your personal
                information. To make a request, contact us at{" "}
                <a href="mailto:obsidianvolleyball@gmail.com" className="text-[#9B4FDE] hover:text-white transition-colors">
                  obsidianvolleyball@gmail.com
                </a>.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl text-white tracking-wide mb-3">CONTACT</h2>
              <p>
                For privacy-related enquiries, email{" "}
                <a href="mailto:obsidianvolleyball@gmail.com" className="text-[#9B4FDE] hover:text-white transition-colors">
                  obsidianvolleyball@gmail.com
                </a>.
              </p>
            </div>

            <div className="border-t border-white/[0.06] pt-6">
              <p className="text-gray-600 text-xs">
                Last updated: April 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
