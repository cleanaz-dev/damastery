import { getClientsDashboard } from "@/lib/actions/get-clients";
import { ClientTable } from "@/components/client/client-table";

// "Upcoming" depends on the current time, so don't let this get cached
export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const { clients, stats } = await getClientsDashboard();

  return (
    <div className="mx-auto max-w-[1440px] w-full space-y-6 p-6">
      {/* Header section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
              Client Management &middot; Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Clients Directory
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            View and manage registered clients, booking history, and intake
            submissions.
          </p>
        </div>
      </header>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Clients
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.totalClients}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Verified Accounts
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {stats.verifiedClients}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Bookings
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {stats.totalBookings}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Upcoming Bookings
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-600">
            {stats.upcomingBookings}
          </p>
        </div>
      </div>

      {/* TanStack Table */}
      <ClientTable data={clients} />
    </div>
  );
}