interface Props {
  permalink: string;
  caption?: string;
  thumbnailGradient?: string;
}

export default function ReelLinkCard({
  permalink,
  caption = "Tap to watch on Instagram",
  thumbnailGradient = "linear-gradient(135deg, #2a0a4a 0%, #0A0A0A 60%, #1a0033 100%)",
}: Props) {
  return (
    <a
      href={permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="group block relative mx-auto overflow-hidden"
      style={{
        width: 326,
        maxWidth: "100%",
        aspectRatio: "9 / 16",
        borderRadius: 24,
        background: thumbnailGradient,
        border: "1px solid rgba(155,79,222,0.25)",
        boxShadow:
          "0 0 60px rgba(155,79,222,0.18), inset 0 0 80px rgba(0,0,0,0.4)",
      }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#7B2FBE]/90 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(155,79,222,0.6)] group-hover:scale-110 group-hover:bg-[#9B4FDE] transition-all duration-300">
          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="text-white font-medium text-sm mb-2">{caption}</p>
        <div className="flex items-center gap-2 text-[#9B4FDE] text-xs tracking-wide opacity-80 group-hover:opacity-100 transition-opacity">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
          @obsidianvolleyball
        </div>
      </div>
    </a>
  );
}
