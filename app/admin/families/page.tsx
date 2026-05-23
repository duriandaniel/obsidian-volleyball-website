import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Family = {
  customer_id: string;
  email: string;
  parent_name: string;
  phone: string | null;
  kids: string[];
  booking_count: number;
  last_booking_at: string | null;
  total_paid_cents: number;
};

async function loadFamilies(): Promise<Family[]> {
  const sb = supabaseAdmin();
  const { data: customers } = await sb
    .from("customers")
    .select("id, email, first_name, last_name, phone")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(200);
  if (!customers || customers.length === 0) return [];

  const customerIds = customers.map((c) => c.id);

  const [{ data: parts }, { data: bookings }, { data: orders }] = await Promise.all([
    sb
      .from("participants")
      .select("customer_id, first_name, last_name")
      .in("customer_id", customerIds)
      .is("deleted_at", null),
    sb
      .from("bookings")
      .select("customer_id, created_at")
      .in("customer_id", customerIds)
      .in("status", ["confirmed", "attended"])
      .is("deleted_at", null),
    sb.from("camp_orders").select("customer_id, total_cents").in("customer_id", customerIds).eq("status", "paid"),
  ]);

  const partsByCustomer = new Map<string, string[]>();
  for (const p of parts ?? []) {
    const arr = partsByCustomer.get(p.customer_id) ?? [];
    arr.push(`${p.first_name} ${p.last_name}`);
    partsByCustomer.set(p.customer_id, arr);
  }
  const bookingCountByCustomer = new Map<string, { count: number; latest: string }>();
  for (const b of bookings ?? []) {
    const cur = bookingCountByCustomer.get(b.customer_id) ?? { count: 0, latest: "" };
    cur.count += 1;
    if (b.created_at > cur.latest) cur.latest = b.created_at;
    bookingCountByCustomer.set(b.customer_id, cur);
  }
  const totalByCustomer = new Map<string, number>();
  for (const o of orders ?? []) {
    totalByCustomer.set(o.customer_id, (totalByCustomer.get(o.customer_id) ?? 0) + (o.total_cents ?? 0));
  }

  return customers.map((c) => {
    const bs = bookingCountByCustomer.get(c.id);
    return {
      customer_id: c.id,
      email: c.email,
      parent_name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || "(no name)",
      phone: c.phone,
      kids: partsByCustomer.get(c.id) ?? [],
      booking_count: bs?.count ?? 0,
      last_booking_at: bs?.latest ?? null,
      total_paid_cents: totalByCustomer.get(c.id) ?? 0,
    };
  });
}

export default async function FamiliesPage() {
  const families = await loadFamilies();

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Families</div>
        <h1 className="font-heading text-3xl">{families.length} customers</h1>
      </div>

      {families.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
          No customers yet.
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 font-normal">Parent</th>
                <th className="text-left px-5 py-3 font-normal">Email</th>
                <th className="text-left px-5 py-3 font-normal">Phone</th>
                <th className="text-left px-5 py-3 font-normal">Kids</th>
                <th className="text-right px-5 py-3 font-normal">Bookings</th>
                <th className="text-right px-5 py-3 font-normal">Total paid</th>
                <th className="text-left px-5 py-3 font-normal">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                <tr key={f.customer_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3">{f.parent_name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    <a href={`mailto:${f.email}`} className="hover:text-[#9B4FDE]">{f.email}</a>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {f.phone ? <a href={`tel:${f.phone}`} className="hover:text-[#9B4FDE]">{f.phone}</a> : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-300">
                    {f.kids.length > 0 ? f.kids.join(", ") : <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right">{f.booking_count}</td>
                  <td className="px-5 py-3 text-right">${(f.total_paid_cents / 100).toFixed(2)}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {f.last_booking_at
                      ? new Date(f.last_booking_at).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
