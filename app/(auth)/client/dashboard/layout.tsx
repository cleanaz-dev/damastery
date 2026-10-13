import { requireUser } from "@/lib/auth-guard";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return <div className="min-h-screen">{children}</div>;
}