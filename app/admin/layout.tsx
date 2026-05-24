import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/supabase/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Admin · Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Allow the login page to render without auth
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "";
  const isLoginPage = pathname.endsWith("/admin/login");

  if (!isLoginPage) {
    const admin = await currentAdmin();
    if (!admin) {
      redirect("/admin/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {!isLoginPage && <AdminNav />}
      <main className="pt-4 pb-16">{children}</main>
    </div>
  );
}

async function AdminNav() {
  const admin = await currentAdmin();
  return (
    <nav className="border-b border-white/10 bg-black/40 sticky top-0 z-40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-heading text-sm tracking-[0.3em] text-[#9B4FDE]">
            OBSIDIAN · ADMIN
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <NavLink href="/admin" label="Today" />
            <NavLink href="/admin/calendar" label="Calendar" />
            <NavLink href="/admin/cancellations" label="Cancellations" />
            <NavLink href="/admin/families" label="Families" />
            <NavLink href="/admin/reports" label="Reports" />
            {admin?.role === "owner" && <NavLink href="/admin/programs" label="Programs" />}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{admin?.email}</span>
          <span className="px-2 py-0.5 rounded bg-[#9B4FDE]/20 text-[#9B4FDE] uppercase tracking-wider">{admin?.role}</span>
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="text-gray-400 hover:text-white">Sign out</button>
          </form>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-gray-300 hover:text-white transition-colors">
      {label}
    </Link>
  );
}
