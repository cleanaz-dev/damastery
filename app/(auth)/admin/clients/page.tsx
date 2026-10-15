// app/admin/clients/page.tsx (or client-dashboard-page.tsx)
import { getAllClients } from "@/lib/actions/get-clients";
import { ClientTable } from "@/components/client/client-table";

export default async function ClientDashboardPage() {
  const clients = await getAllClients();

  const totalClients = clients.length;
  const verifiedClients = clients.filter((c) => c.emailVerified).length;
  const totalBookings = clients.reduce(
    (acc, client) => acc + client.bookings.length,
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Clients Directory
        </h1>
        <p className="text-sm text-gray-500">
          View and manage registered clients, booking history, and intake submissions.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Clients
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalClients}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Verified Accounts
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {verifiedClients}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Total Bookings
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {totalBookings}
          </p>
        </div>
      </div>

      {/* TanStack Table */}
      <ClientTable data={clients} />
    </div>
  );
}