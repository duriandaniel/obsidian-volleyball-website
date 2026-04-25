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
      <blockquote
        className="instagram-media"
        data-instgrm-captioned={caption ? "" : undefined}
        data-instgrm-permalink={permalink}
        data-instgrm-version="14"
        style={{
          background: "#0A0A0A",
          border: "1px solid rgba(255,255,255,0.06)",
          margin: "0 auto",
          maxWidth: 480,
          minWidth: 320,
          width: "100%",
          minHeight: 600,
          padding: 0,
        }}
      />
    </>
  );
}
