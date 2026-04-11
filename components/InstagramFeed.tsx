"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const INSTAGRAM_HANDLE = "obsidianvolleyball";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

interface InstaPost {
  id: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  caption: string;
}

// Fallback images when Instagram API is not configured
const fallbackImages = [
  { src: "/images/gallery-spike.jpg", alt: "Spike at the net" },
  { src: "/images/jersey-detail.jpg", alt: "OVA jersey detail" },
  { src: "/images/gallery-attack.jpg", alt: "Attack drill" },
  { src: "/images/gallery-coaching.jpg", alt: "Coaching session" },
  { src: "/images/gallery-girls.jpg", alt: "Players at the net" },
  { src: "/images/gallery-action2.jpg", alt: "Setting the ball" },
  { src: "/images/coach-instruction.jpg", alt: "Coach instruction" },
  { src: "/images/venue.jpg", alt: "Baulkham Hills High School venue" },
];

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const hasLivePosts = posts.length > 0;

  return (
    <section className="py-24 lg:py-32 bg-[#111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-3">FOLLOW US</p>
            <h2 className="font-heading text-5xl lg:text-7xl text-white tracking-wide">
              @{INSTAGRAM_HANDLE.toUpperCase()}
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#9B4FDE] font-heading text-base tracking-wide hover:text-white transition-colors duration-300"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            FOLLOW ON INSTAGRAM
          </a>
        </motion.div>

        {/* Live Instagram posts */}
        {hasLivePosts ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-2">
            {posts.map((post, i) => (
              <motion.a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="aspect-square relative overflow-hidden group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.mediaUrl}
                  alt={post.caption || "Instagram post"}
                  className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-500"
                  loading="lazy"
                />
                {post.mediaType === "VIDEO" && (
                  <div className="absolute top-2 right-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity={0.8}>
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-[#7B2FBE]/0 group-hover:bg-[#7B2FBE]/10 transition-all duration-500" />
              </motion.a>
            ))}
          </div>
        ) : (
          /* Fallback to static images */
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="grid grid-cols-4 md:grid-cols-8 gap-1 md:gap-2 group"
          >
            {fallbackImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: loaded ? 1 : 0, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="aspect-square relative overflow-hidden"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:brightness-75 transition-all duration-500"
                  sizes="(max-width: 768px) 25vw, 12.5vw"
                  quality={70}
                />
                <div className="absolute inset-0 bg-[#7B2FBE]/0 group-hover:bg-[#7B2FBE]/10 transition-all duration-500" />
              </motion.div>
            ))}
          </a>
        )}
      </div>
    </section>
  );
}
