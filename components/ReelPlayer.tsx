"use client";

import { useState, useRef } from "react";

const CLOUD = "dibp8icbq";

interface Props {
  publicId: string;
  poster?: string;
}

export default function ReelPlayer({ publicId, poster }: Props) {
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = `https://res.cloudinary.com/${CLOUD}/video/upload/q_auto,f_auto/${publicId}.mp4`;
  const posterUrl =
    poster ?? `https://res.cloudinary.com/${CLOUD}/video/upload/so_0/${publicId}.jpg`;

  const handlePlay = () => {
    setPlaying(true);
    videoRef.current?.play();
  };

  if (errored) {
    return (
      <div
        className="relative mx-auto flex flex-col items-center justify-center text-center p-8"
        style={{
          width: 326,
          maxWidth: "100%",
          aspectRatio: "9 / 16",
          borderRadius: 24,
          background:
            "linear-gradient(135deg, #1a0033 0%, #0A0A0A 60%, #1a0033 100%)",
          border: "1px solid rgba(155,79,222,0.25)",
        }}
      >
        <p className="text-[#9B4FDE] font-heading text-xs tracking-[0.3em] mb-3">PLACEHOLDER</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-2">
          Video <code className="text-[#9B4FDE]">{publicId}</code>
        </p>
        <p className="text-gray-500 text-xs">not found in Cloudinary yet</p>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto group"
      style={{
        width: 326,
        maxWidth: "100%",
        aspectRatio: "9 / 16",
        borderRadius: 24,
        overflow: "hidden",
        background: "#0A0A0A",
        border: "1px solid rgba(155,79,222,0.2)",
        boxShadow: "0 0 60px rgba(155,79,222,0.18)",
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        controls={playing}
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
        onError={() => setErrored(true)}
        className="w-full h-full object-cover"
      />
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Play reel"
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors duration-300 hover:bg-black/10"
        >
          <span className="w-20 h-20 rounded-full bg-[#7B2FBE]/90 flex items-center justify-center shadow-[0_0_40px_rgba(155,79,222,0.6)] group-hover:scale-110 group-hover:bg-[#9B4FDE] transition-all duration-300">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
