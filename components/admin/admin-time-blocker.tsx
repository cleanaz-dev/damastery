// components/admin/admin-time-blocker.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminTimeBlockerProps {
  resourceId: string;
}

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "19:00", "20:00"
];

const CATEGORIES = [
  { id: "busy", label: "Work Block / Busy" },
  { id: "lunch", label: "Lunch Break" },
  { id: "personal", label: "Personal / Out of Office" },
  { id: "meeting", label: "Internal Meeting" },
];

export default function AdminTimeBlocker({ resourceId }: AdminTimeBlockerProps) {
  const router = useRouter();

  // Date selection (default today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [category, setCategory] = useState("busy");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Preset Helper
  const applyPreset = (minutes: number) => {
    const [startH, startM] = startTime.split(":").map(Number);
    const dateObj = new Date();
    dateObj.setHours(startH, startM, 0, 0);
    dateObj.setMinutes(dateObj.getMinutes() + minutes);

    const endH = String(dateObj.getHours()).padStart(2, "0");
    const endM = String(dateObj.getMinutes()).padStart(2, "0");
    setEndTime(`${endH}:${endM}`);
  };

  const setFullDay = () => {
    setStartTime("08:00");
    setEndTime("18:00");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Build ISO timestamps without fractional milliseconds for Hapio
    const fromDate = new Date(`${selectedDate}T${startTime}:00`);
    const toDate = new Date(`${selectedDate}T${endTime}:00`);

    if (toDate <= fromDate) {
      setError("End time must be after the start time.");
      setIsSubmitting(false);
      return;
    }

    // Format Y-m-d\TH:i:sP (+00:00)
    const fromStr = fromDate.toISOString().replace(/\.\d{3}Z$/, "+00:00");
    const toStr = toDate.toISOString().replace(/\.\d{3}Z$/, "+00:00");

    try {
      const res = await fetch("/api/admin/schedule/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          from: fromStr,
          to: toStr,
          category,
          note,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to create block");
      }

      setNote("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50/80 border border-red-200/80 p-3.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Date Input */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
          Select Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            required
          />
        </div>
      </div>

      {/* Quick Duration Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Quick Duration
          </label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "30 min", action: () => applyPreset(30) },
            { label: "1 hour", action: () => applyPreset(60) },
            { label: "2 hours", action: () => applyPreset(120) },
            { label: "Full Day", action: setFullDay },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={preset.action}
              className="py-1.5 text-xs font-medium rounded-lg border border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100 text-neutral-700 transition active:scale-[0.98]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Selectors */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
            Start Time
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            {TIME_OPTIONS.map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
            End Time
          </label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          >
            {TIME_OPTIONS.map((time) => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full h-11 px-3 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Internal Note */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
          Internal Note <span className="font-normal text-neutral-400">(Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Lunch break, Off-site client meeting..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 shadow-sm transition hover:border-neutral-300 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      {/* Primary Action Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 flex items-center justify-center rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium tracking-wide shadow-sm transition active:scale-[0.99] disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Blocking Slot...
          </span>
        ) : (
          "Block Selected Time"
        )}
      </button>
    </form>
  );
}