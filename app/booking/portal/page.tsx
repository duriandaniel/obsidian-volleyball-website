import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { PortalLoginForm } from "./PortalLoginForm";
import { CancelButton } from "./CancelButton";

export const metadata: Metadata = {
  title: "Your Bookings | Obsidian Volleyball Academy",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="font-heading text-xs tracking-[0.4em] text-[#9B4FDE] mb-3">OBSIDIAN VOLLEYBALL</div>
            <h1 className="font-heading text-3xl text-white">Manage your bookings</h1>
            <p className="text-sm text-gray-400 mt-3">
              Sign in with the email you used when booking.
            </p>
          </div>
          <PortalLoginForm />
          <p className="text-xs text-gray-500 text-center mt-6">
            New here? Just{" "}
            <Link href="/booking" className="text-[#9B4FDE]">make a booking</Link>{" "}
            first — your account is created automatically.
          </p>
        </div>
      </div>
    );
  }

  // Logged in. Get this user's customer record + bookings.
  const sb = supabaseAdmin();
  const { data: customer } = await sb
    .from("customers")
    .select("id, first_name, last_name, email, phone")
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email?.toLowerCase()}`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#0A0A0A] text-white">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl mb-3">No bookings under {user.email}</h1>
          <p className="text-sm text-gray-400 mb-6">
            We didn&apos;t find any bookings tied to this email. Try signing out and using a different email, or make a booking first.
          </p>
          <form action="/api/booking/portal/logout" method="POST">
            <button type="submit" className="text-sm text-[#9B4FDE] hover:text-white">Sign out</button>
          </form>
        </div>
      </div>
    );
  }

  // Link auth user to customer if not already
  if (customer && !customer.id) {
    // (handled by query above)
  } else {
    await sb
      .from("customers")
      .update({ auth_user_id: user.id })
      .eq("id", customer.id)
      .is("auth_user_id", null);
  }

  const { data: bookings } = await sb
    .from("bookings")
    .select("id, status, source, paid_amount_cents, session_id, participant_id, cancelled_at, refund_status")
    .eq("customer_id", customer.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const sessionIds = Array.from(new Set((bookings ?? []).map((b) => b.session_id)));
  const participantIds = Array.from(new Set((bookings ?? []).map((b) => b.participant_id)));

  const [{ data: sessions }, { data: parts }] = await Promise.all([
    sb.from("sessions").select("id, starts_at, ends_at, program_id, status").in("id", sessionIds),
    sb.from("participants").select("id, first_name, last_name").in("id", participantIds),
  ]);

  const programIds = Array.from(new Set((sessions ?? []).map((s) => s.program_id)));
  const { data: programs } = await sb
    .from("programs")
    .select("id, title, type, refund_policy, cancel_window_hours, venue_id")
    .in("id", programIds);
  const venueIds = Array.from(new Set((programs ?? []).map((p) => p.venue_id)));
  const { data: venues } = await sb.from("venues").select("id, name").in("id", venueIds);

  const sessionById = new Map((sessions ?? []).map((s) => [s.id, s]));
  const partById = new Map((parts ?? []).map((p) => [p.id, p]));
  const programById = new Map((programs ?? []).map((p) => [p.id, p]));
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));

  type BookingRow = NonNullable<typeof bookings>[number];
  const upcoming: BookingRow[] = [];
  const past: BookingRow[] = [];
  const cancelled: BookingRow[] = [];
  const now = new Date();
  for (const b of bookings ?? []) {
    const s = sessionById.get(b.session_id);
    if (!s) continue;
    if (b.status === "cancelled") cancelled.push(b);
    else if (new Date(s.starts_at) >= now) upcoming.push(b);
    else past.push(b);
  }

  const renderBooking = (b: BookingRow, allowCancel: boolean) => {
    const s = sessionById.get(b.session_id);
    const p = partById.get(b.participant_id);
    const program = s ? programById.get(s.program_id) : null;
    const venue = program ? venueById.get(program.venue_id) : null;
    if (!s) return null;

    const startsAt = new Date(s.starts_at);
    const hoursUntil = (startsAt.getTime() - Date.now()) / 36e5;
    const withinWindow = hoursUntil >= (program?.cancel_window_hours ?? 24);

    return (
      <div key={b.id} className="border border-white/10 rounded-lg p-5 bg-white/[0.02]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="font-heading text-lg">
              {p ? `${p.first_name} ${p.last_name}` : "(participant)"}
            </div>
            <div className="text-sm text-gray-400">
              {program?.title ?? "(program)"}
            </div>
            <div className="text-sm text-gray-300 mt-2">
              {startsAt.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Sydney" })}
              {" · "}
              {startsAt.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" })}
              {" – "}
              {new Date(s.ends_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", timeZone: "Australia/Sydney" })}
            </div>
            {venue && <div className="text-xs text-gray-500 mt-1">{venue}</div>}
          </div>
          <div className="text-right">
            <BookingStatusBadge status={b.status} refundStatus={b.refund_status} />
            {b.paid_amount_cents != null && (
              <div className="text-xs text-gray-500 mt-1">${(b.paid_amount_cents / 100).toFixed(2)} paid</div>
            )}
          </div>
        </div>
        {allowCancel && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500 flex-1">
              {program?.refund_policy === "forfeit"
                ? "Term sessions are non-refundable. If you have a significant reason (injury, family situation), email obsidianvolleyball@gmail.com and we'll work something out."
                : program?.refund_policy === "credit"
                ? `Cancel ${program.cancel_window_hours}h+ before for an account credit. Late cancels forfeit.`
                : `Cancel ${program?.cancel_window_hours ?? 24}h+ before for a full refund.`}
            </div>
            <CancelButton bookingId={b.id} withinWindow={withinWindow} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-12 pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Your bookings</div>
            <h1 className="font-heading text-3xl">
              Hi {customer.first_name ?? "there"}
            </h1>
            <p className="text-sm text-gray-400">{customer.email}</p>
          </div>
          <form action="/api/booking/portal/logout" method="POST">
            <button type="submit" className="text-sm text-gray-400 hover:text-white">Sign out</button>
          </form>
        </div>

        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-heading text-xl mb-3">Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">{upcoming.map((b) => renderBooking(b, true))}</div>
            </section>
          )}
          {cancelled.length > 0 && (
            <section>
              <h2 className="font-heading text-xl mb-3">Cancelled ({cancelled.length})</h2>
              <div className="space-y-3">{cancelled.map((b) => renderBooking(b, false))}</div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="font-heading text-xl mb-3">Past ({past.length})</h2>
              <div className="space-y-3">{past.map((b) => renderBooking(b, false))}</div>
            </section>
          )}
          {upcoming.length === 0 && past.length === 0 && cancelled.length === 0 && (
            <div className="border border-white/10 rounded-lg p-10 text-center text-gray-400">
              No bookings yet. <Link href="/booking" className="text-[#9B4FDE]">Book a camp or term</Link>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingStatusBadge({ status, refundStatus }: { status: string; refundStatus: string }) {
  if (status === "cancelled") {
    if (refundStatus === "issued") return <span className="inline-block px-2 py-1 rounded text-xs bg-green-500/15 text-green-400">Refunded</span>;
    if (refundStatus === "declined") return <span className="inline-block px-2 py-1 rounded text-xs bg-white/10 text-gray-400">Cancelled (no refund)</span>;
    return <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-500/15 text-yellow-400">Cancelled (awaiting refund decision)</span>;
  }
  if (status === "attended") return <span className="inline-block px-2 py-1 rounded text-xs bg-green-500/15 text-green-400">Attended</span>;
  if (status === "no_show") return <span className="inline-block px-2 py-1 rounded text-xs bg-red-500/15 text-red-400">No-show</span>;
  return <span className="inline-block px-2 py-1 rounded text-xs bg-[#9B4FDE]/20 text-[#9B4FDE]">Confirmed</span>;
}
