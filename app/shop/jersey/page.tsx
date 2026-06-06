import type { Metadata } from "next";
import Image from "next/image";
import JerseyShop from "./JerseyShop";

export const metadata: Metadata = {
  title: "Obsidian Training Jersey | Obsidian Volleyball Academy",
  description:
    "Get the official Obsidian Volleyball Academy training jersey. Worn by our players at camps and classes. $36, sizes XS to XL.",
  alternates: { canonical: "/shop/jersey" },
};

export default function JerseyShopPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0A0A0A]">
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#111] rounded-lg">
              <Image
                src="/images/jersey-detail.jpg"
                alt="Obsidian Volleyball Academy training jersey"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                className="object-cover"
                priority
              />
            </div>

            {/* Details + buy */}
            <div>
              <p className="text-[#7E57C2] font-heading text-sm tracking-[0.4em] mb-3">OBSIDIAN GEAR</p>
              <h1 className="font-heading text-5xl lg:text-6xl text-white tracking-wide mb-6 leading-[0.95]">
                TRAINING JERSEY
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                The official Obsidian Volleyball Academy training jersey, in our purple gradient squad colours.
                Worn by our players at camps and classes. New players love wearing it from day one.
              </p>
              <ul className="text-gray-400 text-base space-y-2 mb-8">
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Breathable training fabric</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> Sizes XS to XL</li>
                <li className="flex items-center gap-2"><span className="text-[#7E57C2]">+</span> $36 each</li>
              </ul>

              <JerseyShop />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
