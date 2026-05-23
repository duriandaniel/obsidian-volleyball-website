"use client";

import { useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SessionGenerator({ programId }: { programId: string }) {
  const [startDate, setStartDate] = useState(() => {
    const t = new Date();
    t.setDate(t.getDate() + 7);
    return t.toISOString().slice(0, 10);
  });
  const [weeksCount, setWeeksCount] = useState(1);
  const [weekdays, setWeekdays] = useState<number[]>([0, 1, 2, 3, 4]); // Mon-Fri default
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<number | null>(null);

  const toggleDay = (i: number) => {
    setWeekdays((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i].sort()));
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    setCreated(null);
    try {
      const bypass = new URLSearchParams(window.location.search).get("x-vercel-protection-bypass");
      const url = `/api/admin/programs/${programId}/generate-sessions${bypass ? `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}` : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate,
          weeks_count: weeksCount,
          weekdays,
          start_time: startTime,
          end_time: endTime,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setCreated(json.created);
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#9B4FDE]";

  return (
    <div className="border border-white/10 rounded-lg p-5 bg-white/[0.02] space-y-4">
      <p className="text-xs text-gray-400">
        Pick a starting date, how many weeks to generate, and which weekdays to run. Sessions will be created at the time below (Sydney time).
      </p>

      <div className="grid md:grid-cols-3 gap-3">
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">Starting Monday (or first day of range)</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">Weeks to generate</span>
          <input type="number" min="1" max="52" value={weeksCount} onChange={(e) => setWeeksCount(Number(e.target.value))} className={inputCls} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">Start time</span>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1">End time</span>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
          </label>
        </div>
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-2">Weekdays</div>
        <div className="flex gap-2">
          {WEEKDAYS.map((d, i) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDay(i)}
              className={`px-3 py-2 rounded text-xs font-heading tracking-wider ${
                weekdays.includes(i) ? "bg-[#9B4FDE] text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}
      {created != null && <div className="text-sm text-green-400">Created {created} session{created === 1 ? "" : "s"}. Reloading…</div>}

      <button
        type="button"
        onClick={submit}
        disabled={submitting || weekdays.length === 0}
        className="bg-[#9B4FDE] hover:bg-[#7d3fb8] disabled:opacity-50 text-white font-heading text-xs tracking-[0.2em] px-5 py-2.5 rounded"
      >
        {submitting ? "GENERATING…" : "GENERATE SESSIONS"}
      </button>
    </div>
  );
}
