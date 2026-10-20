// app/admin/layout.tsx
import { Space_Grotesk } from "next/font/google";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireAdmin } from "@/lib/auth-guard";

const adminFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-admin",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  await requireAdmin()
  
  return (
    <div className={`${adminFont.variable} font-[family-name:var(--font-admin)]`}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}