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

export const isRegistered = cache(
  async (callbackUrl?: string, registerUrl?: string) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      redirect(
        registerUrl ??
          (callbackUrl
            ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
            : "/register")
      );
    }

    return session;
  }
);
