import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const requireUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/sign-in");

  return session;
});

export const requireAdmin = cache(async () => {
  const session = await requireUser();

  if (session.user.role !== "admin") redirect("/");

  return session;
});