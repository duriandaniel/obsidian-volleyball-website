import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/supabase/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in · Obsidian Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // If already signed in, send them straight to the dashboard
  const admin = await currentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-heading text-xs tracking-[0.4em] text-[#9B4FDE] mb-3">OBSIDIAN · ADMIN</div>
          <h1 className="font-heading text-3xl text-white">Sign in</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
