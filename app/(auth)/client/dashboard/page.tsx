
import { getClientData } from "@/lib/actions/get-client-data";
import { requireUser } from "@/lib/auth-guard";

export default async function ClientDashboardPage() {
    const session = await requireUser()
    const userId = session?.user.id

    const clientData = await getClientData(userId)

    return <ClientDashboardPage data={clientData} />
}