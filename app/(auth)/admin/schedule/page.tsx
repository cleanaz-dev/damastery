// app/(auth)/admin/schedule/page.tsx

export const dynamic = "force-dynamic";

import AdminTimeBlocker from "@/components/admin/admin-time-blocker";
import { getHapioBookings } from "@/lib/hapio";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function toHapioDateString(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

export default async function AdminSchedulePage() {
  const provider = await prisma.provider.findFirst();

  if (!provider || !provider.hapioResourceId) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 rounded-2xl bg-white border border-neutral-200/80 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Resource Not Linked</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          You haven't connected a Hapio calendar resource to this account yet.
        </p>
        <Link
          href="/admin/schedule/setup"
          className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition"
        >
          Complete Setup
        </Link>
      </div>
    );
  }

  const ADMIN_RESOURCE_ID = provider.hapioResourceId;

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const response = await getHapioBookings({
    resourceId: ADMIN_RESOURCE_ID,
    from: toHapioDateString(today),
    to: toHapioDateString(nextWeek),
  });

  const bookings = response.data || [];

  return (
    <div className="min-h-screen py-10 px-6 lg:px-12 max-w-7xl mx-auto space-y-10">
      {/* Header section with refined typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">Calendar Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Schedule Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Managing availability and buffer blocks for <span className="text-neutral-900 font-medium">{provider.name}</span>.
          </p>
        </div>

        <Link
          href="/admin/schedule/setup"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200/90 shadow-sm rounded-xl px-4 py-2.5 transition hover:border-neutral-300"
        >
          <span>Resource Settings</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* Main Grid: Blocker Tool on Left, Timeline on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-5 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-neutral-900 tracking-tight">Block Out Time</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Prevent appointments during personal tasks or breaks.
            </p>
          </div>
          <AdminTimeBlocker resourceId={ADMIN_RESOURCE_ID} />
        </div>

        {/* Right Column: Upcoming Schedule Agenda */}
        <div className="lg:col-span-7 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between pb-5 mb-5 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                Upcoming Schedule
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">Next 7 calendar days</p>
            </div>
            <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
              {bookings.length} {bookings.length === 1 ? "Event" : "Events"}
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-700">No scheduled blocks or client bookings</p>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Your calendar is completely open for the upcoming 7 days.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {bookings.map((booking: any) => {
                const isAdminBlock = Boolean(booking.metadata?.is_admin_block);

                const startDate = new Date(booking.starts_at).toLocaleDateString("en-US", {
                  timeZone: "America/Toronto",
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });

                const startTimeFormatted = new Date(booking.starts_at).toLocaleTimeString("en-US", {
                  timeZone: "America/Toronto",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const endTimeFormatted = new Date(booking.ends_at).toLocaleTimeString("en-US", {
                  timeZone: "America/Toronto",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-neutral-100 hover:border-neutral-200 transition bg-neutral-50/40 hover:bg-neutral-50/90 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAdminBlock ? "bg-amber-500" : "bg-neutral-900"
                          }`}
                        />
                        <span className="text-sm font-medium text-neutral-900">
                          {isAdminBlock
                            ? booking.metadata?.category || "Admin Hold"
                            : "Client Booking"}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 pl-4 font-mono">
                        {startDate} &middot; {startTimeFormatted} &ndash; {endTimeFormatted}
                      </p>

                      {isAdminBlock && booking.metadata?.note && (
                        <p className="text-xs text-neutral-600 pl-4 italic pt-0.5">
                          "{booking.metadata.note}"
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md border ${
                        isAdminBlock
                          ? "bg-amber-50 text-amber-700 border-amber-200/60"
                          : "bg-neutral-900 text-white border-neutral-900"
                      }`}
                    >
                      {isAdminBlock ? "BLOCKED" : "BOOKED"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}