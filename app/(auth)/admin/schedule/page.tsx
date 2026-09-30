// app/(auth)/admin/schedule/page.tsx
import AdminTimeBlocker from "@/components/admin/admin-time-blocker";
import { getHapioBookings } from "@/lib/hapio";
import Link from "next/link";

export default async function AdminSchedulePage() {
  // Replace this with how you retrieve the resource ID (e.g., from DB or env)
  // that was generated in your setup page!
  const ADMIN_RESOURCE_ID = "YOUR_SAVED_RESOURCE_ID"; 

  // Fetch upcoming bookings for the next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

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
          <p className="text-gray-600">Manage your availability and view upcoming appointments.</p>
        </div>
        <Link href="/admin/schedule/setup" className="text-sm text-blue-600 hover:underline">
          Go to Setup &rarr;
        </Link>
      </div>

      {/* Top: The Time Blocker Form */}
      <AdminTimeBlocker resourceId={ADMIN_RESOURCE_ID} />

      {/* Bottom: List of existing bookings / blocked time */}
      <div className="bg-white border shadow-sm rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Upcoming Schedule (Next 7 Days)</h2>
        
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming appointments or blocked times.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking: any) => {
              const isAdminBlock = booking.metadata?.is_admin_block;
              const startDate = new Date(booking.starts_at).toLocaleString();
              const endDate = new Date(booking.ends_at).toLocaleTimeString();

              return (
                <div 
                  key={booking.id} 
                  className={`p-4 rounded-lg border ${
                    isAdminBlock 
                      ? "bg-gray-50 border-gray-200 border-l-4 border-l-gray-500" // Grey for blocked time
                      : "bg-blue-50 border-blue-200 border-l-4 border-l-blue-500" // Blue for client appointments
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {isAdminBlock ? `Admin Block: ${booking.metadata.category}` : "Client Appointment"}
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