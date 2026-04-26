"use client";

import { useState, useRef, useEffect } from "react";

const CLOUD = "dibp8icbq";

interface Props {
  publicId: string;
  poster?: string;
}

export default function ReelPlayer({ publicId, poster }: Props) {
  const [muted, setMuted] = useState(true);
  const [errored, setErrored] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = `https://res.cloudinary.com/${CLOUD}/video/upload/q_auto,f_auto/${publicId}.mp4`;
  const posterUrl =
    poster ?? `https://res.cloudinary.com/${CLOUD}/video/upload/so_0/${publicId}.jpg`;

  // Only play when in view; pause when scrolled away
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const next = !videoRef.current.muted;
    videoRef.current.muted = next;
    setMuted(next);
    if (!next) videoRef.current.play().catch(() => {});
  };

  if (errored) {
    return (
      <div
        className="relative mx-auto flex flex-col items-center justify-center text-center p-8"
        style={{
          width: 326,
          maxWidth: "100%",
          aspectRatio: "9 / 16",
          borderRadius: 16,
          background: "#101010",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p className="text-gray-500 text-sm">Reel unavailable</p>
        <p className="text-gray-700 text-xs mt-1">{publicId}</p>
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
        borderRadius: 16,
        overflow: "hidden",
        background: "#0A0A0A",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onClick={toggleMute}
        onError={() => setErrored(true)}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Sound toggle */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 hover:bg-black/75 hover:scale-105"
      >
        {muted ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.63 3.63a.996.996 0 000 1.41L7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06a8.94 8.94 0 003.61-1.75l2.06 2.06a.996.996 0 101.41-1.41L5.05 3.63a.996.996 0 00-1.42 0zM12 4l-2.71 2.71L12 9.42V4z" />
            <path d="M19 12c0 .82-.15 1.61-.41 2.34l1.53 1.53c.56-1.17.88-2.48.88-3.87 0-3.83-2.4-7.11-5.78-8.4v2.07c2.21 1.13 3.78 3.4 3.78 6.33zM16.5 12A4.5 4.5 0 0014 7.97v1.79l2.48 2.48c.01-.08.02-.16.02-.24z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>
    </div>
  );
}
