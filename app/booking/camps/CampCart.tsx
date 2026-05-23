"use client";

import { useMemo, useState } from "react";
import { priceCampCart, formatCents } from "@/lib/booking/pricing";

import type { CampSessionView } from "./page";
type Session = CampSessionView;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CampCart({ sessions }: { sessions: Session[] }) {
  // Map session_id -> selection { is_half_day: boolean }
  const [selected, setSelected] = useState<Map<string, { is_half_day: boolean }>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricing = useMemo(() => {
    return priceCampCart(
      Array.from(selected.entries()).map(([session_id, { is_half_day }]) => ({
        session_id,
        is_half_day,
      }))
    );
  }, [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, { is_half_day: false });
      return next;
    });
  };

  const setHalfDay = (id: string, isHalf: boolean) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.set(id, { is_half_day: isHalf });
      return next;
    });
  };

  const checkout = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking/camp/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: Array.from(selected.entries()).map(([session_id, { is_half_day }]) => ({
            session_id,
            is_half_day,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? "Checkout failed");
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {sessions.map((s) => {
          const sel = selected.get(s.id);
          const isSelected = !!sel;
          const capacity = s.capacity_override ?? s.programs.default_capacity;
          const remaining = capacity - s.booked;
          const soldOut = remaining <= 0;

          return (
            <div
              key={s.id}
              className={`border rounded-lg p-4 transition-colors ${
                isSelected
                  ? "border-[#9B4FDE] bg-[#9B4FDE]/5"
                  : soldOut
                  ? "border-white/5 opacity-50"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">{s.programs.season ?? s.programs.title}</div>
                  <div className="font-heading text-lg">{formatDate(s.starts_at)}</div>
                  <div className="text-sm text-gray-400">
                    {formatTime(s.starts_at)} – {formatTime(s.ends_at)} · {s.programs.venues.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {soldOut ? "Sold out" : `${remaining} of ${capacity} spots left`}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => toggle(s.id)}
                  className={`px-4 py-2 rounded font-heading text-xs tracking-[0.2em] transition-colors ${
                    isSelected
                      ? "bg-[#9B4FDE] text-white"
                      : "bg-white/5 hover:bg-white/10 text-white"
                  } ${soldOut ? "cursor-not-allowed" : ""}`}
                >
                  {isSelected ? "REMOVE" : "ADD"}
                </button>
              </div>
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setHalfDay(s.id, false)}
                    className={`px-3 py-1.5 rounded ${
                      !sel?.is_half_day ? "bg-[#9B4FDE] text-white" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    Full day · $50
                  </button>
                  <button
                    type="button"
                    onClick={() => setHalfDay(s.id, true)}
                    className={`px-3 py-1.5 rounded ${
                      sel?.is_half_day ? "bg-[#9B4FDE] text-white" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    Half day · $35
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-4 md:sticky md:top-24 self-start border border-white/10 rounded-lg p-6 bg-white/[0.02]">
        <div className="font-heading text-xs tracking-[0.3em] text-[#9B4FDE]">CART</div>
        {selected.size === 0 ? (
          <div className="text-sm text-gray-500">No days selected yet.</div>
        ) : (
          <>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Days</span>
                <span>{pricing.full_day_equivalents}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span>{formatCents(pricing.subtotal_cents)}</span>
              </div>
              {pricing.discount_cents > 0 && (
                <div className="flex justify-between text-[#9B4FDE]">
                  <span>Bundle discount</span>
                  <span>−{formatCents(pricing.discount_cents)}</span>
                </div>
              )}
              <div className="flex justify-between font-heading text-lg pt-2 border-t border-white/10 mt-2">
                <span>Total</span>
                <span>{formatCents(pricing.total_cents)}</span>
              </div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="button"
              onClick={checkout}
              disabled={submitting}
              className="w-full bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-sm tracking-[0.2em] py-3 rounded transition-colors"
            >
              {submitting ? "REDIRECTING..." : "CHECKOUT"}
            </button>
            <div className="text-xs text-gray-500">
              You will be redirected to Stripe to enter card details and parent/child info.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
