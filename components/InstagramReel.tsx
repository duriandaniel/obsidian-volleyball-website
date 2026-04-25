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

type Variant = "default" | "rounded" | "cropped" | "polaroid" | "glass";

interface Props {
  permalink: string;
  variant?: Variant;
}

export default function InstagramReel({ permalink, variant = "default" }: Props) {
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [permalink]);

  const blockquote = (
    <blockquote
      className="instagram-media"
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
      }}
    />
  );

  const script = (
    <Script
      src="https://www.instagram.com/embed.js"
      strategy="lazyOnload"
      onLoad={() => window.instgrm?.Embeds.process()}
    />
  );

  if (variant === "cropped") {
    return (
      <>
        {script}
        <div
          className="relative mx-auto"
          style={{
            width: 326,
            maxWidth: "100%",
            height: 580,
            overflow: "hidden",
            borderRadius: 24,
            boxShadow: "0 0 60px rgba(155,79,222,0.2)",
          }}
        >
          <div style={{ marginTop: -56 }}>{blockquote}</div>
        </div>
      </>
    );
  }

  if (variant === "rounded") {
    return (
      <>
        {script}
        <div
          className="relative inline-block w-full max-w-[420px] mx-auto"
          style={{
            borderRadius: 28,
            overflow: "hidden",
            boxShadow: "0 0 60px rgba(155,79,222,0.18)",
          }}
        >
          {blockquote}
        </div>
      </>
    );
  }

  if (variant === "polaroid") {
    return (
      <>
        {script}
        <div
          className="relative mx-auto"
          style={{
            background: "linear-gradient(180deg, #1a1a1a 0%, #0A0A0A 100%)",
            padding: "20px 16px 60px",
            borderRadius: 6,
            boxShadow:
              "0 30px 60px rgba(0,0,0,0.6), 0 0 80px rgba(155,79,222,0.15)",
            border: "1px solid rgba(155,79,222,0.2)",
            maxWidth: 460,
            width: "100%",
          }}
        >
          <div style={{ borderRadius: 4, overflow: "hidden" }}>{blockquote}</div>
        </div>
      </>
    );
  }

  if (variant === "glass") {
    return (
      <>
        {script}
        <div
          className="relative mx-auto backdrop-blur-md"
          style={{
            background: "rgba(155,79,222,0.06)",
            border: "1px solid rgba(155,79,222,0.2)",
            padding: 12,
            borderRadius: 24,
            maxWidth: 440,
            width: "100%",
            boxShadow:
              "0 0 80px rgba(155,79,222,0.15), inset 0 0 30px rgba(155,79,222,0.05)",
          }}
        >
          <div style={{ borderRadius: 16, overflow: "hidden" }}>{blockquote}</div>
        </div>
      </>
    );
  }

  // default: dark padded frame with purple glow
  return (
    <>
      {script}
      <div className="relative inline-block w-full max-w-[420px] mx-auto">
        <div
          aria-hidden
          className="absolute -inset-3 rounded-2xl blur-2xl opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(155,79,222,0.35) 0%, rgba(123,47,190,0.15) 40%, transparent 70%)",
          }}
        />
        <div className="relative bg-[#0A0A0A] p-2 rounded-xl border border-[#9B4FDE]/30 shadow-[0_0_40px_rgba(155,79,222,0.15)]">
          <div style={{ borderRadius: 8, overflow: "hidden" }}>{blockquote}</div>
        </div>
      </div>
    </>
  );
}
