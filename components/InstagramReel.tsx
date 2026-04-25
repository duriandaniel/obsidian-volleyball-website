"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

interface Props {
  permalink: string;
  caption?: boolean;
}

export default function InstagramReel({ permalink, caption = false }: Props) {
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [permalink]);

  return (
    <>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
      <div className="relative inline-block w-full max-w-[420px] mx-auto">
        {/* Purple glow */}
        <div
          aria-hidden
          className="absolute -inset-3 rounded-2xl blur-2xl opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(155,79,222,0.35) 0%, rgba(123,47,190,0.15) 40%, transparent 70%)",
          }}
        />
        {/* Frame */}
        <div className="relative bg-[#0A0A0A] p-2 rounded-xl border border-[#9B4FDE]/30 shadow-[0_0_40px_rgba(155,79,222,0.15)]">
          <blockquote
            className="instagram-media"
            data-instgrm-captioned={caption ? "" : undefined}
            data-instgrm-permalink={permalink}
            data-instgrm-version="14"
            style={{
              background: "#0A0A0A",
              border: 0,
              margin: 0,
              maxWidth: "100%",
              minWidth: 280,
              width: "100%",
              padding: 0,
              borderRadius: 8,
              overflow: "hidden",
            }}
          />
        </div>
      </div>
    </>
  );
}
