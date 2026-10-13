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
        // THE CENTRAL COLUMN: Centered, max-width, stone background, subtle side borders
        <div className="min-h-screen max-w-5xl mx-auto bg-stone-50 sm:border-x sm:border-stone-200 text-stone-800 font-sans selection:bg-stone-300 shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)]">
            
            {/* Minimal Top Navigation */}
            <nav className="w-full px-8 md:px-12 py-8 flex justify-between items-center border-b border-stone-200/50">
                <span className="font-serif text-lg tracking-wide text-stone-900">damastery.</span>
                <button className="text-sm tracking-widest uppercase text-stone-400 hover:text-stone-800 transition-colors">
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