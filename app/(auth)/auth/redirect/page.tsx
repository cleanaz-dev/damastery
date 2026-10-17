import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // adjust to your auth file path
import { UserRole } from "@/lib/generated/prisma/enums";

export default async function AuthRedirectPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  if (session.user.role === UserRole.ADMIN ) redirect("/admin");

  redirect(`/client/dashboard`);
}