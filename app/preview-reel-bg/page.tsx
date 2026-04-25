import InstagramReel from "@/components/InstagramReel";
import ReelLinkCard from "@/components/ReelLinkCard";
import MockCloudinaryReel from "@/components/MockCloudinaryReel";

const REELS = [
  "https://www.instagram.com/p/DXi_Kgmjaxm/",
  "https://www.instagram.com/p/DW1M195Dasl/",
];

const lightPurple = "#F4ECFB";

interface VariantProps {
  letter: string;
  title: string;
  approach: string;
  pros: string;
  cons: string;
  bg: string;
  accentText: string;
  bodyText: string;
  children: React.ReactNode;
}

function Variant({ letter, title, approach, pros, cons, bg, accentText, bodyText, children }: VariantProps) {
  return (
    <section className="py-20 lg:py-24 relative overflow-hidden border-t border-white/5" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className={`font-heading text-xs tracking-[0.4em] mb-2 ${accentText}`}>OPTION {letter}</p>
        <h2 className={`font-heading text-3xl lg:text-4xl tracking-wide mb-3 ${bg === "#0A0A0A" ? "text-white" : "text-[#1A1A1A]"}`}>
          {title}
        </h2>
        <p className={`text-sm mb-2 ${bodyText}`}><strong>Approach:</strong> {approach}</p>
        <p className={`text-sm mb-1 ${bodyText}`}><strong>Pros:</strong> {pros}</p>
        <p className={`text-sm mb-10 ${bodyText}`}><strong>Cons:</strong> {cons}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 justify-items-center">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function PreviewReelBgPage() {
  return (
    <div className="pt-20 bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-[#9B4FDE] font-heading text-sm tracking-[0.4em] mb-4">PREVIEW</p>
        <h1 className="font-heading text-4xl sm:text-5xl text-white tracking-wide mb-4">
          REEL EMBED OPTIONS
        </h1>
        <p className="text-gray-400 leading-relaxed">
          Eight approaches stacked below. Each shows two reels in the proposed treatment, with notes on tradeoffs. Reply with the letter you want.
        </p>
      </div>

      <Variant
        letter="A"
        title="Default IG embed (current baseline)"
        approach="Instagram's stock embed, dark frame around it, light-purple section background."
        pros="Zero work, IG's official supported method, official chrome shows the @username."
        cons="White IG header/footer clashes with site, square corners, no theme control."
        bg={lightPurple}
        accentText="text-[#7B2FBE]"
        bodyText="text-[#3A3A3A]"
      >
        {REELS.map((url) => <InstagramReel key={`A-${url}`} permalink={url} />)}
      </Variant>

      <Variant
        letter="B"
        title="Soft rounded (border-radius hack)"
        approach="Same IG embed but the wrapper has aggressive border-radius and overflow-hidden so corners are rounded."
        pros="Softens the squareness, super simple."
        cons="White chrome still visible, just with rounded corners."
        bg={lightPurple}
        accentText="text-[#7B2FBE]"
        bodyText="text-[#3A3A3A]"
      >
        {REELS.map((url) => <InstagramReel key={`B-${url}`} permalink={url} variant="rounded" />)}
      </Variant>

      <Variant
        letter="C"
        title="Cropped chrome (CSS hack — show just video)"
        approach="Wrapper clips out IG's header (@username) and footer (likes/comments) with overflow-hidden + negative margin. Just the video portion shows."
        pros="No more IG chrome. Closest to 'just the video'. Works without uploading anything."
        cons="Fragile — if Instagram changes their embed layout this breaks. Aspect-ratio dependent."
        bg={lightPurple}
        accentText="text-[#7B2FBE]"
        bodyText="text-[#3A3A3A]"
      >
        {REELS.map((url) => <InstagramReel key={`C-${url}`} permalink={url} variant="cropped" />)}
      </Variant>

      <Variant
        letter="D"
        title="Cropped chrome on dark background"
        approach="Same crop as C, but the section is the site's dark theme. Video only sits on black."
        pros="No more white box. Matches site theme. Just video."
        cons="Same fragility as C. Loses the 'spotlight' effect of a contrasting bright section."
        bg="#0A0A0A"
        accentText="text-[#9B4FDE]"
        bodyText="text-gray-400"
      >
        {REELS.map((url) => <InstagramReel key={`D-${url}`} permalink={url} variant="cropped" />)}
      </Variant>

      <Variant
        letter="E"
        title="Polaroid frame around full IG embed"
        approach="Thick dark frame surrounds the IG embed like a Polaroid. The frame is the focal point, the white IG chrome reads as part of the frame's interior."
        pros="The white feels intentional inside the frame. Classy."
        cons="Larger visual footprint. Still has IG chrome inside."
        bg="#0A0A0A"
        accentText="text-[#9B4FDE]"
        bodyText="text-gray-400"
      >
        {REELS.map((url) => <InstagramReel key={`E-${url}`} permalink={url} variant="polaroid" />)}
      </Variant>

      <Variant
        letter="F"
        title="Frosted glass frame"
        approach="Translucent purple-tinted glass effect around the IG embed using CSS backdrop-blur."
        pros="Modern and brand-aligned. The blur softens the white-chrome contrast."
        cons="Only works on browsers with backdrop-filter (most modern, fine on iOS/Android)."
        bg="#0A0A0A"
        accentText="text-[#9B4FDE]"
        bodyText="text-gray-400"
      >
        {REELS.map((url) => <InstagramReel key={`F-${url}`} permalink={url} variant="glass" />)}
      </Variant>

      <Variant
        letter="G"
        title="Custom dark thumbnail card (no iframe at all)"
        approach="Replace the IG embed entirely with a dark gradient card, big play button, click opens the reel on Instagram in a new tab. No iframe, no chrome."
        pros="Total theme control. Fast (no iframe). Drives followers to your IG. Works on every device."
        cons="No inline play — extra click. No video preview without a thumbnail. (We can add static thumbnail images per reel.)"
        bg="#0A0A0A"
        accentText="text-[#9B4FDE]"
        bodyText="text-gray-400"
      >
        {REELS.map((url) => <ReelLinkCard key={`G-${url}`} permalink={url} />)}
      </Variant>

      <Variant
        letter="H"
        title="Self-hosted (Cloudinary) — the gold standard"
        approach="You upload your reel MP4s to Cloudinary (your existing account). I render with a clean dark HTML5 player. No Instagram involvement."
        pros="Modern look. Full theme control. Inline play. Apple/Stripe/Vercel use this approach."
        cons="Requires you to upload videos. Bandwidth costs scale with views (currently free tier covers light use)."
        bg="#0A0A0A"
        accentText="text-[#9B4FDE]"
        bodyText="text-gray-400"
      >
        <MockCloudinaryReel label="Reel 1" />
        <MockCloudinaryReel label="Reel 2" />
      </Variant>

      <div className="bg-[#0A0A0A] py-16 text-center border-t border-white/5">
        <p className="text-gray-400 text-sm mb-2">Reply with a letter and I&apos;ll lock it in on the home page.</p>
        <p className="text-gray-600 text-xs">Recommended for Obsidian: <strong className="text-[#9B4FDE]">G</strong> (custom card) for now, <strong className="text-[#9B4FDE]">H</strong> (Cloudinary) once you upload videos.</p>
      </div>
    </div>
  );
}
