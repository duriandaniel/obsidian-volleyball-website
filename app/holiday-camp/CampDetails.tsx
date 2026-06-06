import Image from "next/image";
import SectionReveal from "@/components/SectionReveal";
import TrackedBookingLink from "@/components/TrackedBookingLink";

// Single venue (Obsidian Volleyball Academy at Baulkham Hills High School), so
// camp details render directly with no "choose a location" step.
const VENUE_MAPS_URL = "https://maps.app.goo.gl/c45c2VzRmA5iZVin8";
// Embed pin: our Google place, not the generic "Baulkham Hills High School".
const VENUE_MAPS_EMBED = "https://www.google.com/maps?q=Obsidian+Volleyball+Academy+Baulkham+Hills&output=embed";
// Deep-link straight into the camp booking funnel.
const CAMP_BOOKING_URL = "/booking/camps";

const LEVELS = [
  {
    level: "BEGINNER",
    points: [
      "No prior experience needed",
      "Learn the basics: passing, setting, serving",
      "Friendly, low-pressure environment",
      "Build confidence with the ball",
    ],
  },
  {
    level: "INTERMEDIATE",
    points: [
      "Refine fundamentals and consistency",
      "Spiking, blocking, and rotations",
      "Court awareness and positioning",
      "Game play in modified formats",
    ],
  },
  {
    level: "ADVANCED",
    points: [
      "Higher tempo, full-court game play",
      "Tactics, systems, and team play",
      "Skill polish: jump serve, attacking",
      "Suited to players with club or rep experience",
    ],
  },
];

// Camp photos: kids in the Obsidian jerseys at Baulkham Hills.
const GALLERY = [
  { src: "/images/gallery-game.jpg", alt: "Juniors setting at the net during an Obsidian holiday camp" },
  { src: "/images/gallery-setting.jpg", alt: "A camp player setting the ball in an Obsidian jersey" },
  { src: "/images/jersey-detail.jpg", alt: "Obsidian Volleyball training jersey worn by a camp player" },
  { src: "/images/gallery-action2.jpg", alt: "A junior serving in an Obsidian jersey at camp" },
  { src: "/images/gallery-girls.jpg", alt: "Players warming up at the net in Obsidian jerseys" },
  { src: "/images/gallery-attack.jpg", alt: "A junior attacking during a camp game" },
];

const SCHEDULE = [
  { time: "9:00 AM", title: "Check-in", body: "Drop-off at the venue. Coaches greet players and direct them to the court." },
  { time: "9:15 AM", title: "Introduction & warm-up", body: "Group introduction, mobility, and dynamic warm-up." },
  {
    time: "9:30 AM",
    title: "Split into levels & drills",
    body: "Players move to their level on one of three courts, then we start volleyball drills such as digging, setting, and defence.",
  },
  { time: "11:00 AM", title: "Break", body: "20-minute break. Snacks, water, rest." },
  { time: "11:20 AM", title: "Serving, spiking, game play", body: "Serving and attacking work, then game play. Cool-down at the end." },
  { time: "1:00 PM", title: "Dismissal", body: "Players collected from the venue." },
];

const WHAT_TO_BRING = [
  "Shoes suitable for indoor volleyball",
  "Water bottle — refill stations are available on site",
  "Lunch and snacks for full-day camps",
  "Your Obsidian Volleyball training jersey",
];

export default function CampDetails() {
  return (
    <>
      {/* Gallery — moments from camp */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">INSIDE THE CAMP</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">MOMENTS</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
            {GALLERY.map((img) => (
              <div key={img.src} className="relative aspect-[3/4] overflow-hidden bg-[#111] group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  quality={80}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Train at your level */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">BY ABILITY, NOT AGE</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">TRAIN AT YOUR LEVEL</h2>
            </div>
          </SectionReveal>
          <p className="text-gray-500 text-sm max-w-2xl mb-10">
            Players are grouped by skill level, not age. Three courts, three levels — everyone trains at the right intensity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
            {LEVELS.map((tier) => (
              <div key={tier.level} className="bg-[#111] p-8 lg:p-10 group hover:bg-[#161616] transition-colors duration-500 h-full">
                <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-6">{tier.level}</p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {tier.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="text-[#7E57C2] flex-shrink-0">+</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-sm max-w-2xl mt-10 leading-relaxed">
            Not sure where you fit? No problem. Throughout the camp our coaches encourage players to move up or
            down a level so everyone is challenged at the right intensity and stays engaged.
          </p>
        </div>
      </section>

      {/* Daily Schedule */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">A DAY AT CAMP</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">DAILY SCHEDULE</h2>
            </div>
          </SectionReveal>
          <div className="space-y-0">
            {SCHEDULE.map((slot) => (
              <div key={slot.time} className="grid grid-cols-[80px_1fr] sm:grid-cols-[120px_1fr] gap-4 sm:gap-8 py-5 border-b border-white/[0.06] group">
                <p className="font-heading text-base sm:text-lg text-[#7E57C2] tracking-wider pt-1">{slot.time}</p>
                <div>
                  <p className="text-white text-base sm:text-lg font-medium mb-1 group-hover:text-[#7E57C2] transition-colors duration-300">{slot.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{slot.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">INVESTMENT</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">PRICING</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Single Day */}
            <div className="border border-white/[0.06] p-8 lg:p-10 hover:border-[#7E57C2]/20 transition-all duration-500">
              <p className="text-gray-600 font-heading text-xs tracking-[0.3em] mb-6">FLEXIBLE</p>
              <p className="font-heading text-5xl text-white mb-2">$70</p>
              <p className="text-gray-600 text-sm mb-6">Per day</p>
              <ul className="space-y-3 text-gray-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Single day attendance</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> 9 AM &ndash; 1 PM</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> No commitment required</li>
              </ul>
              <TrackedBookingLink
                tier="single_day"
                location="pricing_single"
                href={CAMP_BOOKING_URL}
                className="block border border-white/15 text-white font-heading text-lg px-6 py-3 tracking-wide text-center hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300"
              >
                BOOK NOW
              </TrackedBookingLink>
            </div>

            {/* 5-Day Week Pass */}
            <div className="border-2 border-[#7E57C2]/40 p-8 lg:p-12 hover:border-[#7E57C2] transition-all duration-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#5E35A8] text-white font-heading text-xs tracking-[0.2em] px-4 py-1.5">BEST VALUE</span>
              </div>
              <p className="text-[#7E57C2] font-heading text-xs tracking-[0.3em] mb-6 mt-2">5-DAY WEEK PASS</p>
              <p className="font-heading text-7xl text-white mb-2">$250</p>
              <p className="text-gray-600 text-sm mb-6">The full week</p>
              <ul className="space-y-3 text-gray-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> All 5 days of camp</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> 9 AM &ndash; 1 PM daily</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Costs less than four single days</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Best value for the full week</li>
              </ul>
              <TrackedBookingLink
                tier="5_day_pack"
                location="pricing_package"
                href={CAMP_BOOKING_URL}
                className="block bg-[#5E35A8] text-white font-heading text-lg px-6 py-4 tracking-wide text-center hover:bg-white hover:text-[#5E35A8] transition-all duration-300 glow-purple"
              >
                BOOK NOW
              </TrackedBookingLink>
            </div>

            {/* Half Day */}
            <div className="border border-white/[0.06] p-8 lg:p-10 hover:border-[#7E57C2]/20 transition-all duration-500">
              <p className="text-gray-600 font-heading text-xs tracking-[0.3em] mb-6">HALF DAY</p>
              <p className="font-heading text-5xl text-white mb-2">$45</p>
              <p className="text-gray-600 text-sm mb-6">Half-day session</p>
              <ul className="space-y-3 text-gray-400 text-sm mb-8">
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Morning session</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> 9 &ndash; 11 AM</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> 2 hours of coaching</li>
              </ul>
              <TrackedBookingLink
                tier="half_day"
                location="pricing_half"
                href={CAMP_BOOKING_URL}
                className="block border border-white/15 text-white font-heading text-lg px-6 py-3 tracking-wide text-center hover:border-[#7E57C2] hover:text-[#7E57C2] transition-all duration-300"
              >
                BOOK NOW
              </TrackedBookingLink>
            </div>
          </div>
          <p className="text-gray-600 text-xs mt-8 tracking-wider">
            ADD AN OBSIDIAN TRAINING JERSEY FOR $36 AT CHECKOUT &middot; OPTIONAL
          </p>
        </div>
      </section>

      {/* What to Bring */}
      <section className="py-20 lg:py-28 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">PREPARE</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">WHAT TO BRING</h2>
            </div>
          </SectionReveal>
          <ul className="space-y-4">
            {WHAT_TO_BRING.map((item, i) => (
              <li key={item} className="flex items-start gap-4 text-gray-300 border-b border-white/[0.06] pb-4">
                <span className="text-[#7E57C2] font-heading text-lg flex-shrink-0 w-6">{i + 1}</span>
                <span className="text-base leading-relaxed pt-0.5">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Venue */}
      <section className="py-20 lg:py-28 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionReveal>
            <div className="mb-12">
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">LOCATION</p>
              <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">VENUE</h2>
            </div>
          </SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
            <div className="flex flex-col justify-center">
              <address className="not-italic space-y-2 mb-6">
                <p className="text-white text-2xl font-heading tracking-wide">Baulkham Hills High School</p>
                <p className="text-gray-500 text-sm">Windsor Road, Baulkham Hills</p>
                <p className="text-gray-500 text-sm">NSW 2153, Sydney</p>
              </address>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-md">
                Free parking on-site. Indoor courts, so camp runs rain or shine. Central to Castle Hill,
                Kellyville, Cherrybrook, and Bella Vista.
              </p>
              <a
                href={VENUE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#7E57C2] text-sm font-medium hover:text-white transition-colors"
              >
                Get directions
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
            <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[340px] overflow-hidden bg-[#111] border border-white/[0.06]">
              <iframe
                src={VENUE_MAPS_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.7) contrast(1.2)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Obsidian Volleyball Academy, Baulkham Hills"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
