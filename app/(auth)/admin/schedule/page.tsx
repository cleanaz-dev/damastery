// app/(auth)/admin/schedule/page.tsx

export const dynamic = "force-dynamic";

import AdminScheduleWorkspace from "@/components/admin/admin-time-blocker";
import { getHapioBookings } from "@/lib/hapio";
import { syncGoogleCalendarToHapio } from "@/lib/sync-google-to-hapio";
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

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 2, 15);

  const fromStr = toHapioDateString(rangeStart);
  const toStr = toHapioDateString(rangeEnd);

  // 1. Automatically pull new events from Dwayne's Google Calendar into Hapio
  await syncGoogleCalendarToHapio(ADMIN_RESOURCE_ID, fromStr, toStr);

  // 2. Fetch updated Hapio bookings (which now include Dwayne's Google events)
  const response = await getHapioBookings({
    resourceId: ADMIN_RESOURCE_ID,
    from: fromStr,
    to: toStr,
  });

  const bookings = response.data || [];

  return (
    <div className="min-h-screen w-full py-10 px-6 lg:px-10 max-w-[1440px] mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Calendar Engine &middot; Google Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Schedule Management
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Managing availability and buffer blocks for{" "}
            <span className="text-neutral-900 font-medium">{provider.name}</span>.
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

      <AdminScheduleWorkspace resourceId={ADMIN_RESOURCE_ID} bookings={bookings} />
    </div>
  );
}