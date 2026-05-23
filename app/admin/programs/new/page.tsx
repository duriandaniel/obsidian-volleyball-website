import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { ProgramForm } from "../ProgramForm";

export const dynamic = "force-dynamic";

export default async function NewProgramPage() {
  const admin = await currentAdmin();
  if (!admin || admin.role !== "owner") redirect("/admin");

  const sb = supabaseAdmin();
  const [{ data: venues }, { data: pricingRules }] = await Promise.all([
    sb.from("venues").select("id, name").is("deleted_at", null).order("name"),
    sb.from("pricing_rules").select("id, name, scope").order("name"),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Programs</div>
        <h1 className="font-heading text-3xl">New program</h1>
      </div>
      <ProgramForm venues={venues ?? []} pricingRules={pricingRules ?? []} />
    </div>
  );
}
