import { getClientData } from "@/lib/actions/get-client-data";
import { requireUser } from "@/lib/auth-guard";
import ClientDashboardView from "@/components/client/client-dashboard-view";

export default async function ClientDashboardPage() {
    const session = await requireUser();
    const userId = session.user.id;

    const clientData = await getClientData(userId);

    if (!clientData) {
        return <div className="p-12 text-center text-stone-500 font-serif">Profile not found.</div>;
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-stone-800 font-sans selection:bg-stone-200">
            {/* Minimal Top Navigation */}
            <nav className="w-full max-w-5xl mx-auto px-6 py-8 flex justify-between items-center">
                <span className="font-serif text-lg tracking-wide text-stone-900">Elevate.</span>
                <button className="text-sm tracking-widest uppercase text-stone-400 hover:text-stone-800 transition-colors">
                    Log out
                </button>
            </nav>

            <main className="w-full max-w-4xl mx-auto px-6 py-16 md:py-24">
                <ClientDashboardView clientData={clientData} />
            </main>
        </div>
    );
}