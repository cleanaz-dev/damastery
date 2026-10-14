// components/admin/admin-time-blocker.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  addMonths,
  subMonths,
  startOfToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isBefore,
  nextMonday,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Ban,
} from "lucide-react";
import { TIME_SLOTS } from "./config";

interface BookingItem {
  id: string;
  starts_at: string;
  ends_at: string;
  metadata?: {
    is_admin_block?: boolean;
    category?: string;
    note?: string;
  };
}

interface AdminTimeBlockerProps {
  resourceId: string;
  bookings?: BookingItem[];
}

const CATEGORIES = [
  {
    id: "Work Block / Busy",
    label: "Busy / Work",
    dot: "bg-neutral-900",
    pill: "bg-neutral-900 text-white border-neutral-900",
    softPill: "bg-neutral-100 text-neutral-800 border-neutral-200",
  },
  {
    id: "Lunch Break",
    label: "Lunch",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 border-amber-200/80",
    softPill: "bg-amber-50/90 text-amber-800 border-amber-200/60",
  },
  {
    id: "Personal",
    label: "Personal",
    dot: "bg-blue-500",
    pill: "bg-blue-50 text-blue-700 border-blue-200/80",
    softPill: "bg-blue-50/90 text-blue-700 border-blue-200/60",
  },
  {
    id: "Out of Office",
    label: "Out of Office",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 border-rose-200/80",
    softPill: "bg-rose-50/90 text-rose-700 border-rose-200/60",
  },
];

function getCategoryStyle(categoryName?: string, isAdminBlock?: boolean) {
  if (!isAdminBlock) {
    return {
      label: "Client Booking",
      dot: "bg-emerald-500",
      softPill: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
    };
  }
  const match = CATEGORIES.find(
    (c) => c.id.toLowerCase() === categoryName?.toLowerCase() || c.label.toLowerCase() === categoryName?.toLowerCase()
  );
  return (
    match || {
      label: categoryName || "Blocked",
      dot: "bg-amber-500",
      softPill: "bg-amber-50 text-amber-800 border-amber-200/70",
    }
  );
}

export default function AdminTimeBlocker({
  resourceId,
  bookings = [],
}: AdminTimeBlockerProps) {
  const router = useRouter();
  const today = startOfToday();

  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [activePreset, setActivePreset] = useState<string | null>("1h");
  const [category, setCategory] = useState("Work Block / Busy");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Build the 7-column calendar days for the active month view
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Group bookings by YYYY-MM-DD in Toronto timezone so rendering on the grid is instant
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    bookings.forEach((b) => {
      const dateObj = new Date(b.starts_at);
      // Format YYYY-MM-DD in America/Toronto
      const key = dateObj.toLocaleDateString("en-CA", {
        timeZone: "America/Toronto",
      });
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDayBookings = bookingsByDate[selectedDateKey] || [];

  // Quick-jump date shortcuts
  const dateShortcuts = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: addDays(today, 1) },
    { label: "+2 Days", date: addDays(today, 2) },
    { label: "Next Mon", date: nextMonday(today) },
  ];

  const handleSelectDate = (day: Date) => {
    setSelectedDate(day);
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(startOfMonth(day));
    }
  };

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

    // Clamp to max available slot in TIME_SLOTS if needed
    const maxSlot = TIME_SLOTS[TIME_SLOTS.length - 1]?.value || "23:30";
    setEndTime(computedEnd > maxSlot ? maxSlot : computedEnd);
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    if (newStart >= endTime) {
      updateDuration(newStart, 60, "1h");
    }
  };

  const setFullDayBlock = () => {
    setActivePreset("full");
    const firstSlot = TIME_SLOTS[0]?.value || "08:00";
    const lastSlot = TIME_SLOTS[TIME_SLOTS.length - 1]?.value || "18:00";
    setStartTime(firstSlot);
    setEndTime(lastSlot);
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT / CENTER: LARGE INTERACTIVE CALENDAR WITH EVENTS RENDERED ON DAYS */}
      <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Calendar Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Click any date to inspect schedule or add a time block.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend */}
            <div className="hidden xl:flex items-center gap-3 mr-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Client
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Blocked
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setCurrentMonth(startOfMonth(today));
                setSelectedDate(today);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
            >
              Today
            </button>

            <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 bg-neutral-50/50">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white transition"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white transition"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
            <div
              key={dayName}
              className="text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400 py-1"
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* 7-Column Month Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = bookingsByDate[dateKey] || [];
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isPast = isBefore(day, today);
            const isTodayDate = isSameDay(day, today);

            return (
              <button
                key={dateKey}
                type="button"
                disabled={isPast}
                onClick={() => handleSelectDate(day)}
                className={`min-h-[104px] p-2 rounded-xl border text-left transition-all flex flex-col justify-between relative group ${
                  isSelected
                    ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/70"
                    : isCurrentMonth
                    ? "border-neutral-200/70 bg-white hover:border-neutral-300"
                    : "border-neutral-100 bg-neutral-50/30 opacity-50"
                } ${isPast ? "opacity-40 cursor-not-allowed hover:border-neutral-200/70" : "cursor-pointer"}`}
              >
                {/* Top Row: Day Number + Event Count Dot */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center ${
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : isTodayDate
                        ? "bg-amber-100 text-amber-900"
                        : "text-neutral-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-medium text-neutral-400">
                      {dayEvents.length} {dayEvents.length === 1 ? "block" : "blocks"}
                    </span>
                  )}
                </div>

                {/* Middle / Bottom: Rendered Time Off & Bookings */}
                <div className="mt-2 space-y-1 w-full overflow-hidden">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const isAdmin = Boolean(ev.metadata?.is_admin_block);
                    const style = getCategoryStyle(ev.metadata?.category, isAdmin);
                    const startStr = new Date(ev.starts_at).toLocaleTimeString("en-US", {
                      timeZone: "America/Toronto",
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate flex items-center gap-1 ${style.softPill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                        <span className="truncate">
                          {startStr} {isAdmin ? ev.metadata?.category || "Blocked" : "Client"}
                        </span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div className="text-[10px] font-medium text-neutral-500 pl-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: SELECTED DAY AGENDA + TIME BLOCKER CONTROLS */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          {/* Selected Date Header & Quick Jump Pills */}
          <div className="space-y-3 pb-5 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Selected Date
                </span>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {format(selectedDate, "EEEE, MMM d")}
                </h3>
              </div>
              <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
                {selectedDayBookings.length}{" "}
                {selectedDayBookings.length === 1 ? "Event" : "Events"}
              </span>
            </div>

            {/* Instant Date Jump Pills */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {dateShortcuts.map((sc) => {
                const active = isSameDay(selectedDate, sc.date);
                return (
                  <button
                    key={sc.label}
                    type="button"
                    onClick={() => handleSelectDate(sc.date)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
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

            {/* Existing Blocks on Selected Date */}
            {selectedDayBookings.length > 0 ? (
              <div className="space-y-2 pt-2 max-h-44 overflow-y-auto pr-1">
                {selectedDayBookings.map((b) => {
                  const isAdmin = Boolean(b.metadata?.is_admin_block);
                  const style = getCategoryStyle(b.metadata?.category, isAdmin);
                  const startFormatted = new Date(b.starts_at).toLocaleTimeString("en-US", {
                    timeZone: "America/Toronto",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endFormatted = new Date(b.ends_at).toLocaleTimeString("en-US", {
                    timeZone: "America/Toronto",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl border border-neutral-200/70 bg-neutral-50/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                          <p className="text-xs font-semibold text-neutral-900 truncate">
                            {isAdmin ? b.metadata?.category || "Admin Hold" : "Client Booking"}
                          </p>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono pl-3.5">
                          {startFormatted} – {endFormatted}
                        </p>
                        {b.metadata?.note && (
                          <p className="text-[11px] text-neutral-500 italic pl-3.5 truncate">
                            "{b.metadata.note}"
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border bg-white text-neutral-600 border-neutral-200 shrink-0">
                        {isAdmin ? "Blocked" : "Booked"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 px-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/50 text-xs text-emerald-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>No blocks on this day — completely open.</span>
              </div>
            )}
          </div>

          {/* TIME BLOCKER FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            {/* 1. QUICK DURATION & TIME RANGE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wider uppercase text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  1. Time & Duration
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

            {/* 2. CATEGORY PILLS */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold tracking-wider uppercase text-neutral-500">
                2. Block Type
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

            {/* 3. NOTE */}
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

            {/* SUBMIT BUTTON */}
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
        </div>
      </div>
    </div>
  );
}