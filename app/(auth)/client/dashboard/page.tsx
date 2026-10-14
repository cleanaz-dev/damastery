import { getClientData } from "@/lib/actions/get-client-data";
import { requireUser } from "@/lib/auth-guard";
import ClientDashboardView from "@/components/client/client-dashboard-view";
import { BookingDrawer } from "@/components/booking/booking-drawer";
import { Button } from "@/components/ui/button";

export default async function ClientDashboardPage() {
  const session = await requireUser();
  const userId = session.user.id;

  const clientData = await getClientData(userId);

  if (!clientData) {
    return (
      <div className="p-12 text-center text-stone-500 font-serif">
        Profile not found.
      </div>
    );
  }

  return (
    <ClientDashboardView
      clientData={clientData}
      bookingAction={
        <BookingDrawer resourceId={process.env.HAPIO_RESOURCE_ID!}>
          <Button variant="link" className="px-0 text-stone-900">
            Book your next session
          </Button>
        </BookingDrawer>
      }
    />
  );
}
