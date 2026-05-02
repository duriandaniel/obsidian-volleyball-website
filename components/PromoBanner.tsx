export default function PromoBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#7B2FBE] via-[#9B4FDE] to-[#7B2FBE]">
      <div className="max-w-7xl mx-auto px-4 py-1.5 text-center">
        <p className="text-[10px] sm:text-[11px] font-heading text-white tracking-[0.25em] uppercase">
          New Player Promotion <span className="opacity-70 mx-2">&middot;</span>{" "}
          Free Training Shirt
        </p>
      </div>
    </div>
  );
}
