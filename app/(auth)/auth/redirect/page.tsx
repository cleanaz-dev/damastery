import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // adjust to your auth file path

export default async function AuthRedirectPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  if (session.user.role === "ADMIN") redirect("/admin");

  redirect(`/client/${session.user.id}`);
}