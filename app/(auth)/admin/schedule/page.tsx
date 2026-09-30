import AdminTimeBlocker from "@/components/admin/admin-time-blocker";
import { getHapioBookings } from "@/lib/hapio";
import Link from "next/link";
import { prisma } from "@/lib/prisma"; // <-- Make sure this points to your instantiated Prisma client

export default async function AdminSchedulePage() {
  // 1. Fetch the provider and their Hapio Resource ID from your DB
  const provider = await prisma.provider.findFirst();

  // 2. Handle the state where setup hasn't been run yet
  if (!provider || !provider.hapioResourceId) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center space-y-4">
        <h1 className="text-2xl font-bold">Setup Required</h1>
        <p className="text-gray-600">You haven't linked a Hapio resource yet.</p>
        <Link href="/admin/schedule/setup" className="text-blue-600 hover:underline">
          Go to Setup
        </Link>
      </div>
    );
  }

  const ADMIN_RESOURCE_ID = provider.hapioResourceId;

  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  // 3. Fetch the bookings using the DB-provided ID
  const response = await getHapioBookings({
    resourceId: ADMIN_RESOURCE_ID,
    from: today.toISOString(),
    to: nextWeek.toISOString(),
  });

  const bookings = response.data || [];

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Management</h1>
          <p className="text-gray-600">Block your availability for {provider.name}.</p>
        </div>
        <Link href="/admin/schedule/setup" className="text-sm text-blue-600 hover:underline">
          Go to Settings &rarr;
        </Link>
      </div>

      {/* DND Blocker Form */}
      <AdminTimeBlocker resourceId={ADMIN_RESOURCE_ID} />

      {/* List of Upcoming Events */}
      <div className="bg-white border shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Upcoming Schedule (Next 7 Days)</h2>
        
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming appointments or blocked times.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking: any) => {
              const isAdminBlock = booking.metadata?.is_admin_block;
              
              // Formatting dates specifically for Toronto Time for display
              const startDate = new Date(booking.starts_at).toLocaleString('en-US', { timeZone: "America/Toronto" });
              const endDate = new Date(booking.ends_at).toLocaleTimeString('en-US', { timeZone: "America/Toronto" });

              return (
                <div 
                  key={booking.id} 
                  className={`p-4 rounded-lg border ${
                    isAdminBlock 
                      ? "bg-gray-50 border-gray-200 border-l-4 border-l-gray-500" 
                      : "bg-blue-50 border-blue-200 border-l-4 border-l-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {isAdminBlock ? `Admin Block (${booking.metadata.category})` : "Client Appointment"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {startDate} - {endDate}
                      </p>
                      {isAdminBlock && booking.metadata.note && (
                        <p className="text-xs text-gray-500 mt-1 italic">Note: {booking.metadata.note}</p>
                      )}
                    </div>
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        isAdminBlock ? "bg-gray-200 text-gray-700" : "bg-blue-200 text-blue-800"
                      }`}>
                        {isAdminBlock ? "BLOCKED" : "BOOKED"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}