// Instant feedback while a (dynamic) booking page renders on the server.
// Applies to /booking and all nested booking routes via the Suspense boundary.
export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 animate-pulse">
        <div className="h-3 w-24 bg-white/10 rounded mb-6" />
        <div className="h-9 w-2/3 bg-white/10 rounded mb-10" />
        <div className="space-y-4">
          <div className="h-20 bg-white/[0.06] border border-white/10 rounded-xl" />
          <div className="h-20 bg-white/[0.06] border border-white/10 rounded-xl" />
          <div className="h-20 bg-white/[0.06] border border-white/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
