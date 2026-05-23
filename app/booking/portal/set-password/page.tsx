import type { Metadata } from "next";
import { SetPasswordForm } from "./SetPasswordForm";

export const metadata: Metadata = {
  title: "Set your password | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.token ?? null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-heading text-xs tracking-[0.4em] text-[#9B4FDE] mb-3">OBSIDIAN VOLLEYBALL</div>
          <h1 className="font-heading text-3xl text-white">Set your password</h1>
          <p className="text-sm text-gray-400 mt-3">
            Pick a password you&apos;ll use to manage your bookings going forward.
          </p>
        </div>
        <SetPasswordForm token={token} />
      </div>
    </div>
  );
}
