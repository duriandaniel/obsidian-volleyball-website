import InstagramReel from "@/components/InstagramReel";

const REELS = [
  "https://www.instagram.com/p/DXi_Kgmjaxm/",
  "https://www.instagram.com/p/DW1M195Dasl/",
];

interface Variant {
  id: string;
  label: string;
  description: string;
  bg: string;
  accentTextClass: string;
  headingClass: string;
  bodyTextClass: string;
  ctaClass: string;
  glow: string;
}

const variants: Variant[] = [
  {
    id: "A",
    label: "A — PURE WHITE",
    description: "Maximum contrast spotlight. White section breaks the dark theme as a feature.",
    bg: "#FFFFFF",
    accentTextClass: "text-[#7B2FBE]",
    headingClass: "text-black",
    bodyTextClass: "text-gray-700",
    ctaClass: "text-[#7B2FBE] hover:text-black",
    glow: "transparent",
  },
  {
    id: "B",
    label: "B — WARM CREAM",
    description: "Editorial off-white. Softer than pure white, feels premium.",
    bg: "#F4EFE6",
    accentTextClass: "text-[#7B2FBE]",
    headingClass: "text-[#1A1A1A]",
    bodyTextClass: "text-[#3A3A3A]",
    ctaClass: "text-[#7B2FBE] hover:text-[#1A1A1A]",
    glow: "rgba(123,47,190,0.08)",
  },
  {
    id: "C",
    label: "C — LIGHT PURPLE TINT",
    description: "Brand-aligned. Light lavender pulls in the purple identity.",
    bg: "#F4ECFB",
    accentTextClass: "text-[#7B2FBE]",
    headingClass: "text-[#1A1A1A]",
    bodyTextClass: "text-[#3A3A3A]",
    ctaClass: "text-[#7B2FBE] hover:text-[#1A1A1A]",
    glow: "rgba(123,47,190,0.18)",
  },
  {
    id: "D",
    label: "D — COOL LIGHT GREY",
    description: "Neutral, modern, no warm or branded undertones.",
    bg: "#EDEEF0",
    accentTextClass: "text-[#7B2FBE]",
    headingClass: "text-[#1A1A1A]",
    bodyTextClass: "text-[#3A3A3A]",
    ctaClass: "text-[#7B2FBE] hover:text-[#1A1A1A]",
    glow: "rgba(0,0,0,0.04)",
  },
];

export default function PreviewReelBgPage() {
  return (
    <div className="pt-20 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">PREVIEW</p>
        <h1 className="font-heading text-4xl sm:text-5xl text-white tracking-wide mb-4">
          REEL SECTION BACKGROUNDS
        </h1>
        <p className="text-gray-400 leading-relaxed">
          Four options stacked below, each showing two reels side by side. Pick a letter and I&apos;ll lock it in on the home page.
        </p>
      </div>

      {variants.map((v) => (
        <section
          key={v.id}
          className="py-24 lg:py-32 relative overflow-hidden"
          style={{ background: v.bg }}
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, ${v.glow} 0%, transparent 60%)`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className={`font-heading text-xs tracking-[0.4em] mb-6 ${v.accentTextClass}`}>
              {v.label}
            </p>
            <div className="mb-12 max-w-3xl">
              <p className={`font-heading text-sm tracking-[0.4em] mb-3 ${v.accentTextClass}`}>
                SEE US IN ACTION
              </p>
              <h2 className={`font-heading text-5xl lg:text-7xl tracking-wide mb-6 ${v.headingClass}`}>
                ON <span className="text-[#7B2FBE]">COURT</span>
              </h2>
              <p className={`max-w-xl leading-relaxed mb-4 ${v.bodyTextClass}`}>
                Mic&apos;d-up coaching, live drills, and full-tempo game play. Follow along for new clips every week.
              </p>
              <p className={`text-xs leading-relaxed italic mb-6 ${v.bodyTextClass}`}>
                {v.description}
              </p>
              <a
                href="https://instagram.com/obsidianvolleyball"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-colors ${v.ctaClass}`}
              >
                Follow on Instagram
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
              {REELS.map((url) => (
                <InstagramReel key={`${v.id}-${url}`} permalink={url} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <div className="bg-[#0A0A0A] py-16 text-center">
        <p className="text-gray-500 text-sm">
          Reply with the letter (A / B / C / D) and I&apos;ll apply it to the home page.
        </p>
      </div>
    </div>
  );
}
