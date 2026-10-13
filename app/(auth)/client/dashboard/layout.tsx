// app/(auth)/client/layout.tsx (or wherever this file lives)
import { requireUser } from "@/lib/auth-guard";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  // Added bg-white so the far left/right edges of large screens are pure white
  return <div className="min-h-screen bg-white">{children}</div>;
}