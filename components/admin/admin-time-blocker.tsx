// components/admin/admin-time-blocker.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  subDays,
  addWeeks,
  subWeeks,
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
  Clock,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  CalendarDays,
  Columns,
  Calendar as CalendarIcon,
} from "lucide-react";
import { TIME_SLOTS } from "./config";
import type { AdminBlockCategory } from "@/lib/hapio";

interface BookingItem {
  id: string;
  starts_at: string;
  ends_at: string;
  metadata?: {
    is_admin_block?: boolean;
    category?: AdminBlockCategory | string;
    note?: string;
  };
}

interface AdminTimeBlockerProps {
  resourceId: string;
  bookings?: BookingItem[];
}

type ViewMode = "month" | "week" | "day";

const HOUR_HEIGHT = 56; // 56px per hour in 7-Day & Daily views
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const CATEGORIES: {
  id: AdminBlockCategory;
  label: string;
  dot: string;
  blockStyle: string;
}[] = [
  {
    id: "work",
    label: "Busy / Work",
    dot: "bg-neutral-900",
    blockStyle: "bg-neutral-900 text-white border-neutral-900",
  },
  {
    id: "personal",
    label: "Personal / Break",
    dot: "bg-amber-500",
    blockStyle: "bg-amber-50 text-amber-900 border-amber-300",
  },
  {
    id: "meeting",
    label: "Meeting",
    dot: "bg-blue-500",
    blockStyle: "bg-blue-50 text-blue-900 border-blue-300",
  },
  {
    id: "maintenance",
    label: "Out of Office",
    dot: "bg-rose-500",
    blockStyle: "bg-rose-50 text-rose-900 border-rose-300",
  },
];

function getCategoryConfig(categoryName?: string, isAdminBlock?: boolean) {
  if (!isAdminBlock) {
    return {
      label: "Client Booking",
      dot: "bg-emerald-500",
      blockStyle: "bg-emerald-50 text-emerald-900 border-emerald-300",
    };
  }
  const normalized = (categoryName || "").toLowerCase();
  const match = CATEGORIES.find(
    (c) =>
      c.id === normalized ||
      c.label.toLowerCase().includes(normalized) ||
      (normalized.includes("work") && c.id === "work") ||
      (normalized.includes("lunch") && c.id === "personal") ||
      (normalized.includes("office") && c.id === "maintenance")
  );
  return (
    match || {
      label: categoryName || "Admin Block",
      dot: "bg-amber-500",
      blockStyle: "bg-amber-50 text-amber-900 border-amber-300",
    }
  );
}

// Extracts decimal hours (e.g., 13.5 for 1:30 PM) in America/Toronto time
function getTorontoTimeParts(isoStr: string) {
  const d = new Date(isoStr);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return {
    hour,
    minute,
    decimal: hour + minute / 60,
    formatted: d.toLocaleTimeString("en-US", {
      timeZone: "America/Toronto",
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export default function AdminTimeBlocker({
  resourceId,
  bookings = [],
}: AdminTimeBlockerProps) {
  const router = useRouter();
  const today = startOfToday();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState<Date>(today);
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [activePreset, setActivePreset] = useState<string | null>("1h");
  const [category, setCategory] = useState<AdminBlockCategory>("work");
  const [note, setNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Group all bookings by YYYY-MM-DD in America/Toronto timezone
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    bookings.forEach((b) => {
      const key = new Date(b.starts_at).toLocaleDateString("en-CA", {
        timeZone: "America/Toronto",
      });
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  // Days for Month View
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Days for 7-Day Week View
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDayBookings = bookingsByDate[selectedDateKey] || [];

  // Navigation handlers based on active viewMode
  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else {
      const prev = subDays(currentDate, 1);
      setCurrentDate(prev);
      setSelectedDate(prev);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else {
      const next = addDays(currentDate, 1);
      setCurrentDate(next);
      setSelectedDate(next);
    }
  };

  const handleSelectDate = (day: Date) => {
    setSelectedDate(day);
    setCurrentDate(day);
  };

  // Clicking an hour cell in 7-Day or Daily view selects that date + pre-fills start/end time
  const handleHourCellClick = (day: Date, hour: number) => {
    setSelectedDate(day);
    setCurrentDate(day);
    const clickedStart = `${String(hour).padStart(2, "0")}:00`;
    setStartTime(clickedStart);
    updateDuration(clickedStart, 60, "1h");
  };

  const updateDuration = (baseStart: string, minutes: number, presetKey: string) => {
    setActivePreset(presetKey);
    const [startH, startM] = baseStart.split(":").map(Number);
    const d = new Date();
    d.setHours(startH, startM, 0, 0);
    d.setMinutes(d.getMinutes() + minutes);

    const endH = String(d.getHours()).padStart(2, "0");
    const endM = String(d.getMinutes()).padStart(2, "0");
    const computedEnd = `${endH}:${endM}`;

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
    const firstSlot = TIME_SLOTS[0]?.value || "00:00";
    const lastSlot = TIME_SLOTS[TIME_SLOTS.length - 1]?.value || "23:30";
    setStartTime(firstSlot);
    setEndTime(lastSlot);
  };

  const handleDeleteBlock = async (bookingId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeletingId(bookingId);
    setError(null);

    try {
      const res = await fetch(`/api/admin/schedule/block?id=${bookingId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Could not remove block.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete block.");
    } finally {
      setDeletingId(null);
    }
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

  // Header Title based on active view
  const headerTitle = useMemo(() => {
    if (viewMode === "month") return format(currentDate, "MMMM yyyy");
    if (viewMode === "week") {
      const start = weekDays[0];
      const end = weekDays[6];
      return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
    }
    return format(selectedDate, "EEEE, MMMM d, yyyy");
  }, [viewMode, currentDate, weekDays, selectedDate]);

  const dateShortcuts = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: addDays(today, 1) },
    { label: "+2 Days", date: addDays(today, 2) },
    { label: "Next Mon", date: nextMonday(today) },
  ];

  // Shared Renderer for 7-Day and Daily Hourly Grid
  const renderTimeGrid = (daysToRender: Date[]) => (
    <div className="border border-neutral-200/80 rounded-xl overflow-hidden bg-white">
      {/* Sticky Day Column Headers */}
      <div
        className="grid border-b border-neutral-200 bg-neutral-50/70"
        style={{
          gridTemplateColumns: `64px repeat(${daysToRender.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="p-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-neutral-400 border-r border-neutral-200/70 flex items-center justify-center">
          EST
        </div>
        {daysToRender.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isSameDay(day, today);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => handleSelectDate(day)}
              className={`py-2.5 px-2 text-center border-r last:border-r-0 border-neutral-200/70 transition ${
                isSelected ? "bg-neutral-900 text-white" : "hover:bg-neutral-100/70"
              }`}
            >
              <div
                className={`text-[10px] font-semibold uppercase tracking-wider ${
                  isSelected
                    ? "text-neutral-300"
                    : isTodayDate
                    ? "text-amber-600"
                    : "text-neutral-400"
                }`}
              >
                {format(day, "EEE")}
              </div>
              <div
                className={`text-sm font-semibold mt-0.5 ${
                  isSelected ? "text-white" : "text-neutral-900"
                }`}
              >
                {format(day, "d")}
              </div>
            </button>
          );
        })}
      </div>

      {/* Scrollable 24-Hour Timeline */}
      <div className="max-h-[640px] overflow-y-auto relative">
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `64px repeat(${daysToRender.length}, minmax(0, 1fr))`,
            height: `${24 * HOUR_HEIGHT}px`,
          }}
        >
          {/* Left Hour Labels Column */}
          <div className="border-r border-neutral-200/70 bg-neutral-50/40 select-none">
            {HOURS.map((h) => (
              <div
                key={h}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="pr-2 pt-1 text-right text-[10px] font-mono text-neutral-400 border-b border-neutral-100"
              >
                {format(new Date(2026, 0, 1, h, 0), "h a")}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {daysToRender.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayEvents = bookingsByDate[dateKey] || [];
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={dateKey}
                className={`relative border-r last:border-r-0 border-neutral-200/70 ${
                  isSelected ? "bg-neutral-50/40" : "bg-white"
                }`}
              >
                {/* Clickable Hour Slots */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    onClick={() => handleHourCellClick(day, h)}
                    title={`Click to set ${format(day, "MMM d")} at ${format(
                      new Date(2026, 0, 1, h),
                      "h:00 a"
                    )}`}
                    className="border-b border-neutral-100 hover:bg-neutral-100/60 transition cursor-pointer"
                  />
                ))}

                {/* Rendered Bookings & Blocked Time Overlays */}
                {dayEvents.map((ev) => {
                  const isAdmin = Boolean(ev.metadata?.is_admin_block);
                  const style = getCategoryConfig(ev.metadata?.category, isAdmin);
                  const startParts = getTorontoTimeParts(ev.starts_at);
                  const endParts = getTorontoTimeParts(ev.ends_at);

                  // Handle blocks that end at 23:59 or wrap
                  const endDecimal =
                    endParts.decimal <= startParts.decimal ? 24 : endParts.decimal;
                  const durationHours = Math.max(0.5, endDecimal - startParts.decimal);

                  const topPx = startParts.decimal * HOUR_HEIGHT;
                  const heightPx = durationHours * HOUR_HEIGHT;

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDate(day);
                      }}
                      style={{
                        top: `${topPx + 1}px`,
                        height: `${Math.max(24, heightPx - 2)}px`,
                      }}
                      className={`absolute left-1 right-1 rounded-lg border px-2 py-1 text-xs shadow-sm overflow-hidden flex flex-col justify-between group z-10 ${style.blockStyle}`}
                    >
                      <div className="flex items-start justify-between gap-1 min-w-0">
                        <div className="truncate font-semibold text-[11px] leading-tight">
                          {style.label}
                        </div>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteBlock(ev.id, e)}
                            disabled={deletingId === ev.id}
                            title="Remove block"
                            className="opacity-80 hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition shrink-0"
                          >
                            {deletingId === ev.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {heightPx >= 38 && (
                        <div className="text-[10px] opacity-80 font-mono truncate">
                          {startParts.formatted} – {endParts.formatted}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT / CENTER: MULTI-VIEW CALENDAR (MONTH / 7-DAY / DAILY) */}
      <div className="lg:col-span-8 bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        {/* Calendar Top Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-neutral-100">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
              {headerTitle}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {viewMode === "month"
                ? "Click any day to inspect or add a time block."
                : "Click any hour row on the timeline to pre-fill the time blocker."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: Month | 7 Day | Daily */}
            <div className="inline-flex items-center rounded-xl bg-neutral-100 p-1 border border-neutral-200/60">
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === "month"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Month
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === "week"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                7 Day
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("day");
                  setCurrentDate(selectedDate);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  viewMode === "day"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Daily
              </button>
            </div>

            {/* Today & Prev/Next Controls */}
            <button
              type="button"
              onClick={() => {
                setCurrentDate(today);
                setSelectedDate(today);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
            >
              Today
            </button>

            <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 bg-neutral-50/50">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white transition"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-white transition"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: MONTH GRID */}
        {viewMode === "month" && (
          <>
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {monthDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayEvents = bookingsByDate[dateKey] || [];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isPast = isBefore(day, today);
                const isTodayDate = isSameDay(day, today);

                return (
                  <button
                    key={dateKey}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleSelectDate(day)}
                    className={`min-h-[104px] p-2 rounded-xl border text-left transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-neutral-50/70"
                        : isCurrentMonth
                        ? "border-neutral-200/70 bg-white hover:border-neutral-300"
                        : "border-neutral-100 bg-neutral-50/30 opacity-50"
                    } ${isPast ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                  >
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
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 space-y-1 w-full overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const isAdmin = Boolean(ev.metadata?.is_admin_block);
                        const style = getCategoryConfig(ev.metadata?.category, isAdmin);
                        const startParts = getTorontoTimeParts(ev.starts_at);

                        return (
                          <div
                            key={ev.id}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate flex items-center gap-1 ${style.blockStyle}`}
                          >
                            <span className="truncate">
                              {startParts.formatted} {style.label}
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
          </>
        )}

        {/* VIEW 2: 7-DAY HOURLY SCHEDULE */}
        {viewMode === "week" && renderTimeGrid(weekDays)}

        {/* VIEW 3: DAILY HOURLY SCHEDULE */}
        {viewMode === "day" && renderTimeGrid([selectedDate])}
      </div>

      {/* RIGHT COLUMN: SELECTED DAY INSPECTOR (WITH DELETE) + TIME BLOCKER */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          {/* Selected Date Summary + Existing Blocks List */}
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
                {selectedDayBookings.length === 1 ? "Block" : "Blocks"}
              </span>
            </div>

            {/* Instant Date Shortcuts */}
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

            {/* Active Blocks on Selected Day with Delete Button */}
            {selectedDayBookings.length > 0 ? (
              <div className="space-y-2 pt-2 max-h-48 overflow-y-auto pr-1">
                {selectedDayBookings.map((b) => {
                  const isAdmin = Boolean(b.metadata?.is_admin_block);
                  const style = getCategoryConfig(b.metadata?.category, isAdmin);
                  const startParts = getTorontoTimeParts(b.starts_at);
                  const endParts = getTorontoTimeParts(b.ends_at);

                  return (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/60 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                          <p className="text-xs font-semibold text-neutral-900 truncate">
                            {style.label}
                          </p>
                        </div>
                        <p className="text-[11px] text-neutral-500 font-mono pl-3.5">
                          {startParts.formatted} – {endParts.formatted}
                        </p>
                        {b.metadata?.note && (
                          <p className="text-[11px] text-neutral-500 italic pl-3.5 truncate">
                            "{b.metadata.note}"
                          </p>
                        )}
                      </div>

                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteBlock(b.id)}
                          disabled={deletingId === b.id}
                          className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition shrink-0"
                          title="Delete time block"
                        >
                          {deletingId === b.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200 shrink-0">
                          Client
                        </span>
                      )}
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wider uppercase text-neutral-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  1. Time & Duration
                </label>
                <span className="text-[11px] text-neutral-400 font-medium">EST / Toronto</span>
              </div>

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