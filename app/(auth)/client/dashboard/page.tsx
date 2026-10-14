import { getClientData } from "@/lib/actions/get-client-data";
import { requireUser } from "@/lib/auth-guard";
import ClientDashboardView from "@/components/client/client-dashboard-view";

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

  return <ClientDashboardView clientData={clientData} />;
}