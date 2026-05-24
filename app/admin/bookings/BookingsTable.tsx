"use client";

import { Fragment, useMemo, useState } from "react";

export type BookingRow = {
  booking_id: string;
  booking_status: string;
  booking_source: string;
  booking_created_at: string;
  paid_amount_cents: number | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  refund_status: string;
  refund_amount_cents: number | null;
  attended_marked_at: string | null;
  camp_order_id: string | null;
  enrolment_id: string | null;
  session_id: string;
  session_starts_at: string;
  session_ends_at: string;
  session_status: string;
  program_title: string;
  program_type: string;
  program_skill_level: string | null;
  venue_name: string;
  customer_id: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_email: string;
  customer_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  photo_consent: boolean;
  participant_id: string;
  participant_first_name: string;
  participant_last_name: string;
  participant_date_of_birth: string | null;
  participant_school_name: string | null;
  participant_year_at_school: string | null;
  participant_volleyball_level: string | null;
  participant_medical_notes: string | null;
};

type SortKey =
  | "session_starts_at"
  | "booking_created_at"
  | "participant"
  | "customer"
  | "program_title";
type SortDir = "asc" | "desc";

const SOURCES = ["term", "camp", "trial", "comp", "admin_manual"] as const;
const STATUSES = ["pending", "confirmed", "attended", "cancelled", "no_show"] as const;

const SOURCE_LABEL: Record<string, string> = {
  term: "Term",
  camp: "Camp",
  trial: "Trial",
  comp: "Comp",
  admin_manual: "Manual",
};

const SOURCE_STYLE: Record<string, string> = {
  term: "bg-[#9B4FDE]/15 text-[#C49DFF] border-[#9B4FDE]/30",
  camp: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  trial: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  comp: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  admin_manual: "bg-gray-500/15 text-gray-300 border-gray-500/30",
};

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  attended: "bg-[#9B4FDE]/15 text-[#C49DFF] border-[#9B4FDE]/30",
  cancelled: "bg-red-500/15 text-red-300 border-red-500/30",
  no_show: "bg-orange-500/15 text-orange-300 border-orange-500/30",
};

function fmtDateTime(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", {
    timeZone: "Australia/Sydney",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCents(cents: number | null) {
  if (cents === null || cents === undefined) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

function parentName(r: BookingRow) {
  return `${r.customer_first_name ?? ""} ${r.customer_last_name ?? ""}`.trim() || "(no name)";
}

function kidName(r: BookingRow) {
  return `${r.participant_first_name} ${r.participant_last_name}`.trim() || "(no name)";
}

export default function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const [sources, setSources] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [venue, setVenue] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("session_starts_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const venues = useMemo(() => {
    return Array.from(new Set(rows.map((r) => r.venue_name))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (sources.size > 0 && !sources.has(r.booking_source)) return false;
      if (statuses.size > 0 && !statuses.has(r.booking_status)) return false;
      if (venue && r.venue_name !== venue) return false;
      if (q) {
        const hay = `${parentName(r)} ${kidName(r)} ${r.customer_email} ${r.customer_phone ?? ""} ${r.program_title}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, sources, statuses, venue, search]);

  const sorted = useMemo(() => {
    const cmp = (a: BookingRow, b: BookingRow): number => {
      let av: string | number = "";
      let bv: string | number = "";
      switch (sortKey) {
        case "session_starts_at":
          av = a.session_starts_at;
          bv = b.session_starts_at;
          break;
        case "booking_created_at":
          av = a.booking_created_at;
          bv = b.booking_created_at;
          break;
        case "participant":
          av = kidName(a).toLowerCase();
          bv = kidName(b).toLowerCase();
          break;
        case "customer":
          av = parentName(a).toLowerCase();
          bv = parentName(b).toLowerCase();
          break;
        case "program_title":
          av = a.program_title.toLowerCase();
          bv = b.program_title.toLowerCase();
          break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    };
    return [...filtered].sort(cmp);
  }, [filtered, sortKey, sortDir]);

  function toggleSet(s: Set<string>, val: string, setter: (s: Set<string>) => void) {
    const next = new Set(s);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    setter(next);
  }

  function setSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "session_starts_at" || key === "booking_created_at" ? "desc" : "asc");
    }
  }

  function exportCsv() {
    const headers = [
      "Session start", "Session end", "Program", "Type", "Skill", "Venue",
      "Status", "Source", "Kid", "DOB", "School", "Year", "Level", "Medical notes",
      "Parent", "Email", "Phone", "Emergency name", "Emergency phone", "Photo consent",
      "Paid amount", "Paid at", "Booked on", "Cancelled at", "Cancelled by", "Cancellation reason",
      "Refund status", "Refund amount", "Attended marked at",
      "Booking ID", "Customer ID", "Participant ID", "Session ID",
    ];
    const escape = (v: unknown) => {
      const s = v === null || v === undefined ? "" : String(v);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const lines = [headers.join(",")];
    for (const r of sorted) {
      lines.push([
        r.session_starts_at, r.session_ends_at, r.program_title, r.program_type, r.program_skill_level, r.venue_name,
        r.booking_status, r.booking_source, kidName(r), r.participant_date_of_birth, r.participant_school_name,
        r.participant_year_at_school, r.participant_volleyball_level, r.participant_medical_notes,
        parentName(r), r.customer_email, r.customer_phone, r.emergency_contact_name, r.emergency_contact_phone,
        r.photo_consent ? "yes" : "no",
        fmtCents(r.paid_amount_cents), r.paid_at, r.booking_created_at, r.cancelled_at, r.cancelled_by, r.cancellation_reason,
        r.refund_status, fmtCents(r.refund_amount_cents), r.attended_marked_at,
        r.booking_id, r.customer_id, r.participant_id, r.session_id,
      ].map(escape).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ova-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="border border-white/10 rounded-lg p-4 mb-4 bg-white/[0.02]">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">Type:</span>
          {SOURCES.map((src) => {
            const active = sources.has(src);
            return (
              <button
                key={src}
                onClick={() => toggleSet(sources, src, setSources)}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${
                  active ? SOURCE_STYLE[src] : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
                }`}
              >
                {SOURCE_LABEL[src]}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider mr-1">Status:</span>
          {STATUSES.map((st) => {
            const active = statuses.has(st);
            return (
              <button
                key={st}
                onClick={() => toggleSet(statuses, st, setStatuses)}
                className={`px-2.5 py-1 rounded-full text-xs border transition ${
                  active ? STATUS_STYLE[st] : "border-white/10 text-gray-500 hover:text-gray-300 hover:border-white/20"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search name, email, phone, program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[240px] bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm placeholder:text-gray-600 focus:border-[#9B4FDE]/50 focus:outline-none"
          />
          <select
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-[#9B4FDE]/50 focus:outline-none"
          >
            <option value="">All venues</option>
            {venues.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <select
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(":") as [SortKey, SortDir];
              setSortKey(k);
              setSortDir(d);
            }}
            className="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm focus:border-[#9B4FDE]/50 focus:outline-none"
          >
            <option value="session_starts_at:desc">Session date (newest)</option>
            <option value="session_starts_at:asc">Session date (oldest)</option>
            <option value="booking_created_at:desc">Booked on (newest)</option>
            <option value="booking_created_at:asc">Booked on (oldest)</option>
            <option value="customer:asc">Parent A→Z</option>
            <option value="participant:asc">Kid A→Z</option>
            <option value="program_title:asc">Program A→Z</option>
          </select>
          <button
            onClick={exportCsv}
            className="text-xs px-3 py-1.5 border border-white/10 rounded hover:border-[#9B4FDE]/40 hover:text-[#C49DFF] transition"
          >
            Export CSV
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-3">
          {sorted.length} of {rows.length} bookings
          {(sources.size > 0 || statuses.size > 0 || venue || search) && (
            <button
              onClick={() => {
                setSources(new Set());
                setStatuses(new Set());
                setVenue("");
                setSearch("");
              }}
              className="ml-3 text-[#C49DFF] hover:underline"
            >
              clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-10 text-center text-gray-500 text-sm">
          No bookings match the current filters.
        </div>
      ) : (
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase tracking-wider bg-white/[0.02]">
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 font-normal cursor-pointer hover:text-white" onClick={() => setSort("session_starts_at")}>
                    Session {sortKey === "session_starts_at" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-left px-4 py-3 font-normal cursor-pointer hover:text-white" onClick={() => setSort("program_title")}>
                    Program {sortKey === "program_title" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-left px-4 py-3 font-normal">Type</th>
                  <th className="text-left px-4 py-3 font-normal">Status</th>
                  <th className="text-left px-4 py-3 font-normal cursor-pointer hover:text-white" onClick={() => setSort("participant")}>
                    Kid {sortKey === "participant" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-left px-4 py-3 font-normal cursor-pointer hover:text-white" onClick={() => setSort("customer")}>
                    Parent {sortKey === "customer" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-left px-4 py-3 font-normal">Contact</th>
                  <th className="text-right px-4 py-3 font-normal">Paid</th>
                  <th className="text-left px-4 py-3 font-normal cursor-pointer hover:text-white" onClick={() => setSort("booking_created_at")}>
                    Booked {sortKey === "booking_created_at" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                  </th>
                  <th className="text-left px-4 py-3 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => {
                  const open = expandedId === r.booking_id;
                  return (
                    <Fragment key={r.booking_id}>
                      <tr
                        onClick={() => setExpandedId(open ? null : r.booking_id)}
                        className={`border-b border-white/5 cursor-pointer hover:bg-white/[0.03] ${open ? "bg-white/[0.04]" : ""}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-gray-200">{fmtDateTime(r.session_starts_at)}</div>
                          <div className="text-[10px] text-gray-500">{r.venue_name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-gray-200">{r.program_title}</div>
                          {r.program_skill_level && (
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">{r.program_skill_level}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border uppercase tracking-wider ${SOURCE_STYLE[r.booking_source] ?? "border-white/10 text-gray-400"}`}>
                            {SOURCE_LABEL[r.booking_source] ?? r.booking_source}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border uppercase tracking-wider ${STATUS_STYLE[r.booking_status] ?? "border-white/10 text-gray-400"}`}>
                            {r.booking_status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-200">{kidName(r)}</td>
                        <td className="px-4 py-3 text-gray-200">{parentName(r)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                          <a href={`mailto:${r.customer_email}`} onClick={(e) => e.stopPropagation()} className="block hover:text-[#C49DFF]">
                            {r.customer_email}
                          </a>
                          {r.customer_phone && (
                            <a href={`tel:${r.customer_phone}`} onClick={(e) => e.stopPropagation()} className="block hover:text-[#C49DFF]">
                              {r.customer_phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-300">{fmtCents(r.paid_amount_cents)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(r.booking_created_at)}</td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5">
                            <button
                              disabled
                              title="Coming soon"
                              className="text-[10px] px-2 py-1 border border-white/10 rounded text-gray-600 cursor-not-allowed"
                            >
                              Email
                            </button>
                            <button
                              disabled
                              title="Coming soon"
                              className="text-[10px] px-2 py-1 border border-white/10 rounded text-gray-600 cursor-not-allowed"
                            >
                              SMS
                            </button>
                          </div>
                        </td>
                      </tr>
                      {open && (
                        <tr className="bg-black/30 border-b border-white/10">
                          <td colSpan={10} className="px-4 py-4">
                            <DetailPanel row={r} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPanel({ row }: { row: BookingRow }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
      <Section title="Participant">
        <Field label="Full name" value={`${row.participant_first_name} ${row.participant_last_name}`} />
        <Field label="DOB" value={fmtDate(row.participant_date_of_birth)} />
        <Field label="School" value={row.participant_school_name} />
        <Field label="Year" value={row.participant_year_at_school} />
        <Field label="Volleyball level" value={row.participant_volleyball_level} />
        <Field label="Medical notes" value={row.participant_medical_notes} wide />
      </Section>
      <Section title="Customer + emergency">
        <Field label="Parent" value={`${row.customer_first_name ?? ""} ${row.customer_last_name ?? ""}`.trim()} />
        <Field label="Email" value={row.customer_email} />
        <Field label="Phone" value={row.customer_phone} />
        <Field label="Emergency contact" value={row.emergency_contact_name} />
        <Field label="Emergency phone" value={row.emergency_contact_phone} />
        <Field label="Photo consent" value={row.photo_consent ? "yes" : "no"} />
      </Section>
      <Section title="Payment + lifecycle">
        <Field label="Paid amount" value={fmtCents(row.paid_amount_cents)} />
        <Field label="Paid at" value={fmtDate(row.paid_at)} />
        <Field label="Stripe PI" value={row.stripe_payment_intent_id} mono />
        <Field label="Cancelled at" value={fmtDate(row.cancelled_at)} />
        <Field label="Cancelled by" value={row.cancelled_by} />
        <Field label="Cancellation reason" value={row.cancellation_reason} wide />
        <Field label="Refund status" value={row.refund_status} />
        <Field label="Refund amount" value={fmtCents(row.refund_amount_cents)} />
        <Field label="Attended marked at" value={fmtDate(row.attended_marked_at)} />
        <Field label="Camp order ID" value={row.camp_order_id} mono />
        <Field label="Enrolment ID" value={row.enrolment_id} mono />
        <Field label="Booking ID" value={row.booking_id} mono />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] text-[#C49DFF] uppercase tracking-wider mb-2 font-semibold">{title}</div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function Field({ label, value, wide, mono }: { label: string; value: string | number | null | undefined; wide?: boolean; mono?: boolean }) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div className={wide ? "" : "flex justify-between gap-3"}>
      <dt className="text-gray-500">{label}</dt>
      <dd className={`text-gray-200 ${mono ? "font-mono text-[10px]" : ""} ${wide ? "mt-0.5" : "text-right"}`}>
        {display}
      </dd>
    </div>
  );
}
