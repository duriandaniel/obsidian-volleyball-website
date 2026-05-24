import { supabaseAdmin } from "@/lib/supabase/server";
import BookingsTable, { type BookingRow } from "./BookingsTable";

export const dynamic = "force-dynamic";

async function loadBookings(): Promise<BookingRow[]> {
  const sb = supabaseAdmin();
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data: sessions } = await sb
    .from("sessions")
    .select("id, starts_at, ends_at, status, program_id")
    .gte("starts_at", ninetyDaysAgo)
    .is("deleted_at", null);

  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);
  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  const programIds = Array.from(new Set(sessions.map((s) => s.program_id)));
  const { data: programs } = await sb
    .from("programs")
    .select("id, title, type, venue_id, skill_level")
    .in("id", programIds);
  const programById = new Map((programs ?? []).map((p) => [p.id, p]));

  const venueIds = Array.from(new Set((programs ?? []).map((p) => p.venue_id)));
  const { data: venues } = await sb.from("venues").select("id, name").in("id", venueIds);
  const venueById = new Map((venues ?? []).map((v) => [v.id, v.name]));

  const { data: bookings } = await sb
    .from("bookings")
    .select("*")
    .in("session_id", sessionIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!bookings || bookings.length === 0) return [];

  const customerIds = Array.from(new Set(bookings.map((b) => b.customer_id)));
  const participantIds = Array.from(new Set(bookings.map((b) => b.participant_id)));
  const [{ data: customers }, { data: participants }] = await Promise.all([
    sb.from("customers").select("*").in("id", customerIds).is("deleted_at", null),
    sb.from("participants").select("*").in("id", participantIds).is("deleted_at", null),
  ]);
  const customerById = new Map((customers ?? []).map((c) => [c.id, c]));
  const participantById = new Map((participants ?? []).map((p) => [p.id, p]));

  return bookings.map((b) => {
    const session = sessionById.get(b.session_id);
    const program = session ? programById.get(session.program_id) : null;
    const venue = program ? venueById.get(program.venue_id) : null;
    const customer = customerById.get(b.customer_id);
    const participant = participantById.get(b.participant_id);
    return {
      booking_id: b.id,
      booking_status: b.status,
      booking_source: b.source,
      booking_created_at: b.created_at,
      paid_amount_cents: b.paid_amount_cents,
      stripe_payment_intent_id: b.stripe_payment_intent_id,
      paid_at: b.paid_at,
      cancelled_at: b.cancelled_at,
      cancelled_by: b.cancelled_by,
      cancellation_reason: b.cancellation_reason,
      refund_status: b.refund_status,
      refund_amount_cents: b.refund_amount_cents,
      attended_marked_at: b.attended_marked_at,
      camp_order_id: b.camp_order_id,
      enrolment_id: b.enrolment_id,
      session_id: b.session_id,
      session_starts_at: session?.starts_at ?? "",
      session_ends_at: session?.ends_at ?? "",
      session_status: session?.status ?? "",
      program_title: program?.title ?? "(unknown)",
      program_type: program?.type ?? "",
      program_skill_level: program?.skill_level ?? null,
      venue_name: venue ?? "(unknown)",
      customer_id: b.customer_id,
      customer_first_name: customer?.first_name ?? null,
      customer_last_name: customer?.last_name ?? null,
      customer_email: customer?.email ?? "",
      customer_phone: customer?.phone ?? null,
      emergency_contact_name: customer?.emergency_contact_name ?? null,
      emergency_contact_phone: customer?.emergency_contact_phone ?? null,
      photo_consent: customer?.photo_consent ?? false,
      participant_id: b.participant_id,
      participant_first_name: participant?.first_name ?? "",
      participant_last_name: participant?.last_name ?? "",
      participant_date_of_birth: participant?.date_of_birth ?? null,
      participant_school_name: participant?.school_name ?? null,
      participant_year_at_school: participant?.year_at_school ?? null,
      participant_volleyball_level: participant?.volleyball_level ?? null,
      participant_medical_notes: participant?.medical_notes ?? null,
    };
  });
}

export default async function BookingsPage() {
  const rows = await loadBookings();
  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
      <div className="mb-5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bookings · CRM</div>
        <h1 className="font-heading text-3xl">{rows.length} bookings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Sessions in the last 90 days + all future. Filter by type, status, venue. Click any row to expand full record.
        </p>
      </div>
      <BookingsTable rows={rows} />
    </div>
  );
}
