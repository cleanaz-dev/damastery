// app/dashboard/page.tsx
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
        // THE CENTRAL COLUMN: Darker stone-200. Zero borders. Zero shadows.
        <div className="min-h-screen max-w-5xl mx-auto bg-stone-200 text-stone-800 font-sans selection:bg-stone-400">
            
            {/* Minimal Top Navigation - border removed completely */}
            <nav className="w-full px-8 md:px-12 py-8 flex justify-between items-center">
                <span className="font-serif text-lg tracking-wide text-stone-900">damastery.</span>
                <button className="text-sm tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors">
                    Log out
                </button>
            </nav>

            {/* Dashboard Content */}
            <main className="w-full max-w-4xl mx-auto px-8 md:px-12 py-16 md:py-24">
                <ClientDashboardView clientData={clientData} />
            </main>
            
        </div>
    );
}