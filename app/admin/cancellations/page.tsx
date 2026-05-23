import { supabaseAdmin } from "@/lib/supabase/server";
import { RefundButton } from "./RefundButton";

export const dynamic = "force-dynamic";

type Row = {
  booking_id: string;
  cancelled_at: string;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  paid_amount_cents: number | null;
  refund_status: string;
  refund_amount_cents: number | null;
  stripe_payment_intent_id: string | null;
  participant_name: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string | null;
  session_starts_at: string;
  program_title: string;
};

async function loadCancellations(): Promise<Row[]> {
  const sb = supabaseAdmin();
  const { data: bookings } = await sb
    .from("bookings")
    .select(
      "id, cancelled_at, cancelled_by, cancellation_reason, paid_amount_cents, refund_status, refund_amount_cents, stripe_payment_intent_id, session_id, participant_id, customer_id"
    )
    .eq("status", "cancelled")
    .is("deleted_at", null)
    .order("cancelled_at", { ascending: false })
    .limit(100);
  if (!bookings || bookings.length === 0) return [];

  const sessionIds = Array.from(new Set(bookings.map((b) => b.session_id)));
  const participantIds = Array.from(new Set(bookings.map((b) => b.participant_id)));
  const customerIds = Array.from(new Set(bookings.map((b) => b.customer_id)));

  const [{ data: sessions }, { data: parts }, { data: custs }] = await Promise.all([
    sb.from("sessions").select("id, starts_at, program_id").in("id", sessionIds),
    sb.from("participants").select("id, first_name, last_name").in("id", participantIds),
    sb.from("customers").select("id, first_name, last_name, email, phone").in("id", customerIds),
  ]);

  const programIds = Array.from(new Set((sessions ?? []).map((s) => s.program_id)));
  const { data: programs } = await sb.from("programs").select("id, title").in("id", programIds);
  const programById = new Map((programs ?? []).map((p) => [p.id, p.title]));
  const sessionById = new Map((sessions ?? []).map((s) => [s.id, s]));
  const partById = new Map((parts ?? []).map((p) => [p.id, p]));
  const custById = new Map((custs ?? []).map((c) => [c.id, c]));

  return bookings.map((b) => {
    const session = sessionById.get(b.session_id);
    const part = partById.get(b.participant_id);
    const cust = custById.get(b.customer_id);
    return {
      booking_id: b.id,
      cancelled_at: b.cancelled_at!,
      cancelled_by: b.cancelled_by,
      cancellation_reason: b.cancellation_reason,
      paid_amount_cents: b.paid_amount_cents,
      refund_status: b.refund_status,
      refund_amount_cents: b.refund_amount_cents,
      stripe_payment_intent_id: b.stripe_payment_intent_id,
      participant_name: part ? `${part.first_name} ${part.last_name}` : "(unknown)",
      parent_name: cust ? `${cust.first_name ?? ""} ${cust.last_name ?? ""}`.trim() : "",
      parent_email: cust?.email ?? "",
      parent_phone: cust?.phone ?? null,
      session_starts_at: session?.starts_at ?? "",
      program_title: session ? programById.get(session.program_id) ?? "(unknown)" : "(unknown)",
    };
  });
}

function fmtCents(c: number | null) {
  if (c == null) return "—";
  return `$${(c / 100).toFixed(2)}`;
}

export default async function CancellationsPage() {
  const rows = await loadCancellations();
  const pending = rows.filter((r) => r.refund_status === "none" || r.refund_status === "requested");

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cancellations</div>
        <h1 className="font-heading text-3xl">{pending.length} pending decisions</h1>
        <p className="text-sm text-gray-400 mt-1">
          Cancelled bookings awaiting your refund decision. Issue a Stripe refund or mark as resolved without refund.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
          No cancellations yet.
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 font-normal">Cancelled</th>
                <th className="text-left px-5 py-3 font-normal">By</th>
                <th className="text-left px-5 py-3 font-normal">Booking</th>
                <th className="text-left px-5 py-3 font-normal">Parent contact</th>
                <th className="text-left px-5 py-3 font-normal">Reason</th>
                <th className="text-right px-5 py-3 font-normal">Paid</th>
                <th className="text-left px-5 py-3 font-normal">Refund</th>
                <th className="text-right px-5 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.booking_id} className="border-b border-white/5 align-top">
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {new Date(r.cancelled_at).toLocaleString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-300">{r.cancelled_by ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="text-white">{r.participant_name}</div>
                    <div className="text-xs text-gray-500">{r.program_title}</div>
                    {r.session_starts_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(r.session_starts_at).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney", dateStyle: "medium" })}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="text-gray-300">{r.parent_name}</div>
                    <div className="text-gray-500">{r.parent_email}</div>
                    {r.parent_phone && <div className="text-gray-500">{r.parent_phone}</div>}
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-300 max-w-xs">
                    {r.cancellation_reason || <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-5 py-4 text-right">{fmtCents(r.paid_amount_cents)}</td>
                  <td className="px-5 py-4">
                    <RefundStatusBadge status={r.refund_status} amount={r.refund_amount_cents} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {(r.refund_status === "none" || r.refund_status === "requested") && r.paid_amount_cents ? (
                      <RefundButton bookingId={r.booking_id} maxCents={r.paid_amount_cents} />
                    ) : (
                      <span className="text-xs text-gray-500">—</span>
                    )}
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

function RefundStatusBadge({ status, amount }: { status: string; amount: number | null }) {
  const styles: Record<string, string> = {
    none: "bg-yellow-500/15 text-yellow-400",
    requested: "bg-yellow-500/15 text-yellow-400",
    issued: "bg-green-500/15 text-green-400",
    declined: "bg-white/10 text-gray-400",
  };
  const label =
    status === "issued"
      ? `Refunded ${amount != null ? `$${(amount / 100).toFixed(2)}` : ""}`
      : status === "declined"
      ? "Resolved (no refund)"
      : "Awaiting decision";
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs ${styles[status] ?? "bg-white/10 text-gray-400"}`}>
      {label}
    </span>
  );
}
