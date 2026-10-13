import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import type { PendingClient } from "@/lib/actions/first-time-contact";
import { RegisterForm } from "@/components/forms/register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) notFound();

  const pending = await redis.get<PendingClient>(`client:${token}`);
  if (!pending) notFound(); // expired or invalid link

  return (
    <main>
      <RegisterForm
        token={token}
        defaults={{ name: pending.name, email: pending.email }}
      />
    </main>
  );
}