// app/dashboard/page.tsx
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

  return (
    // OUTER WRAPPER: Full width, relative positioning to hold the background
    <div className="relative min-h-screen w-full bg-stone-100 text-stone-800 font-sans selection:bg-stone-400">
      
      {/* 
        BACKGROUND LOGO LAYER: 
        - `fixed inset-0` keeps it covering the entire screen even when you scroll
        - `bg-cover bg-center` makes it span the whole background 
        - `opacity-60` dials it back so it's a subtle watermark (adjust up or down as needed)
        - `pointer-events-none` prevents it from blocking clicks on your links/buttons
      */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-60 bg-[url('/logo-white.png')] bg-center bg-no-repeat bg-cover"
      />

      {/* CENTRAL COLUMN: Elevated above the background (z-10) and centered */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col min-h-screen">
        
        {/* Minimal Top Navigation */}
        <nav className="w-full px-8 md:px-12 py-8 flex justify-between items-center">
          <span className="font-serif text-lg tracking-wide text-stone-900">
            damastery.
          </span>
          {/* Stripped the white background off the logout button too for maximum clean text-based aesthetic */}
          <button className="px-5 py-2 text-xs font-semibold tracking-wider text-stone-500 uppercase border border-stone-300 rounded-full hover:border-stone-500 hover:text-stone-900 transition-all">
            Log Out
          </button>
        </nav>

        {/* Dashboard Content */}
        <main className="flex-1 w-full max-w-4xl mx-auto px-8 md:px-12 py-16">
          <ClientDashboardView clientData={clientData} />
        </main>
      </div>
      
    </div>
  );
}