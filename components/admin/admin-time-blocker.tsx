// components/admin/admin-time-blocker.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, isSameDay, nextMonday, startOfToday } from "date-fns";
import { Calendar as CalendarIcon, Clock, Sparkles, Check } from "lucide-react";

interface AdminTimeBlockerProps {
  resourceId: string;
}

const TIME_SLOTS = [
  { value: "08:00", label: "8:00 AM" },
  { value: "08:30", label: "8:30 AM" },
  { value: "09:00", label: "9:00 AM" },
  { value: "09:30", label: "9:30 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "10:30", label: "10:30 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "12:30", label: "12:30 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "13:30", label: "1:30 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "17:30", label: "5:30 PM" },
  { value: "18:00", label: "6:00 PM" },
];

const CATEGORIES = [
  { id: "Work Block / Busy", label: "Busy / Work", dot: "bg-neutral-900" },
  { id: "Lunch Break", label: "Lunch", dot: "bg-amber-500" },
  { id: "Personal", label: "Personal", dot: "bg-blue-500" },
  { id: "Out of Office", label: "Out of Office", dot: "bg-rose-500" },
];

export default function AdminTimeBlocker({ resourceId }: AdminTimeBlockerProps) {
  const router = useRouter();
  const today = startOfToday();

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [activePreset, setActivePreset] = useState<string | null>("1h");
  const [category, setCategory] = useState("Work Block / Busy");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Quick-jump date shortcuts
  const dateShortcuts = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: addDays(today, 1) },
    { label: "+2 Days", date: addDays(today, 2) },
    { label: "Next Mon", date: nextMonday(today) },
  ];

  // Helper to shift end time automatically when clicking a preset or new start time
  const updateDuration = (baseStart: string, minutes: number, presetKey: string) => {
    setActivePreset(presetKey);
    const [startH, startM] = baseStart.split(":").map(Number);
    const d = new Date();
    d.setHours(startH, startM, 0, 0);
    d.setMinutes(d.getMinutes() + minutes);

    const endH = String(d.getHours()).padStart(2, "0");
    const endM = String(d.getMinutes()).padStart(2, "0");
    const computedEnd = `${endH}:${endM}`;

    // Clamp to max available slot if needed
    setEndTime(computedEnd > "18:00" ? "18:00" : computedEnd);
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // Automatically keep 1-hour offset if end time would become invalid
    if (newStart >= endTime) {
      updateDuration(newStart, 60, "1h");
    }
  };

  const setFullDayBlock = () => {
    setActivePreset("full");
    setStartTime("08:00");
    setEndTime("18:00");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const datePart = format(selectedDate, "yyyy-MM-dd");
    const fromDate = new Date(`${datePart}T${startTime}:00`);
    const toDate = new Date(`${datePart}T${endTime}:00`);

    if (toDate <= fromDate) {
      setError("End time must be after the start time.");
      setIsSubmitting(false);
      return;
    }

    // Format strictly to PHP Y-m-d\TH:i:sP (no milliseconds)
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
        throw new Error(body.message || "Failed to block time slot.");
      }

      setNote("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* 1. HOTEL-STYLE CALENDAR CARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider uppercase text-neutral-500 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-neutral-400" />
            1. Select Date
          </label>
          <span className="text-xs font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-md">
            {format(selectedDate, "EEE, MMM d, yyyy")}
          </span>
        </div>

        {/* Instant Date Jump Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {dateShortcuts.map((sc) => {
            const active = isSameDay(selectedDate, sc.date);
            return (
              <button
                key={sc.label}
                type="button"
                onClick={() => setSelectedDate(sc.date)}
                className={`py-2 px-2 rounded-lg text-xs font-medium border transition-all ${
                  active
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "bg-neutral-50/70 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>

        {/* Embedded Shadcn Calendar */}
        <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/30 p-3 flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={{ before: today }}
            className="p-0"
            classNames={{
              selected:
                "bg-neutral-900 text-white hover:bg-neutral-800 focus:bg-neutral-900 rounded-lg font-semibold",
              today: "bg-neutral-200/70 text-neutral-900 font-semibold rounded-lg",
            }}
          />
        </div>
      </div>

      {/* 2. QUICK DURATION & TIME RANGE */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold tracking-wider uppercase text-neutral-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            2. Time & Duration
          </label>
          <span className="text-[11px] text-neutral-400 font-medium">EST / Toronto</span>
        </div>

        {/* Duration Pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "30m", label: "30 Min", mins: 30 },
            { id: "1h", label: "1 Hour", mins: 60 },
            { id: "2h", label: "2 Hours", mins: 120 },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => updateDuration(startTime, preset.mins, preset.id)}
              className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                activePreset === preset.id
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={setFullDayBlock}
            className={`py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${
              activePreset === "full"
                ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : "bg-amber-50/60 text-amber-800 border-amber-200/80 hover:bg-amber-100/70"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Full Day
          </button>
        </div>

        {/* Start & End Time Selectors */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-2.5 focus-within:border-neutral-900 focus-within:bg-white transition">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              From
            </span>
            <select
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              className="mt-0.5 w-full bg-transparent text-sm font-semibold text-neutral-900 focus:outline-none cursor-pointer"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={`from-${slot.value}`} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-2.5 focus-within:border-neutral-900 focus-within:bg-white transition">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Until
            </span>
            <select
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setActivePreset(null);
              }}
              className="mt-0.5 w-full bg-transparent text-sm font-semibold text-neutral-900 focus:outline-none cursor-pointer"
            >
              {TIME_SLOTS.map((slot) => (
                <option
                  key={`to-${slot.value}`}
                  value={slot.value}
                  disabled={slot.value <= startTime}
                >
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY PILLS */}
      <div className="space-y-2.5">
        <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500">
          3. Block Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900/5 text-neutral-900 ring-1 ring-neutral-900"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${cat.dot}`} />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. NOTE */}
      <div>
        <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-2">
          Internal Note <span className="font-normal text-neutral-400">(Optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Off-site meeting, Personal appointment..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 transition focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        />
      </div>

      {/* SUBMIT BUTTON WITH SUMMARY */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium shadow-sm transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? (
          <span>Confirming Block...</span>
        ) : success ? (
          <>
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Time Blocked Successfully</span>
          </>
        ) : (
          <span>
            Block {format(selectedDate, "MMM d")} &middot; {startTime} – {endTime}
          </span>
        )}
      </button>
    </form>
  );
}