interface Props {
  label?: string;
}

export default function MockCloudinaryReel({ label = "Your reel" }: Props) {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 326,
        maxWidth: "100%",
        aspectRatio: "9 / 16",
        borderRadius: 24,
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #1a0033 0%, #0A0A0A 50%, #1a0033 100%)",
        boxShadow: "0 0 60px rgba(155,79,222,0.25)",
        border: "1px solid rgba(155,79,222,0.3)",
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-[#7B2FBE]/90 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(155,79,222,0.5)]">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-white font-heading text-sm tracking-[0.2em] mb-2">{label.toUpperCase()}</p>
        <p className="text-gray-500 text-xs px-6 text-center max-w-[260px] leading-relaxed">
          Cloudinary-hosted MP4 with custom dark player. No Instagram chrome. Just the video.
        </p>
      </div>
    </div>
  );
}
