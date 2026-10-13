import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import type { PendingClient } from "@/lib/actions/first-time-contact";
import { IntakeForm } from "@/components/forms/intake-form";
import { isRegistered } from "@/lib/auth-guard";

const forms = {
  intake: IntakeForm,
} as const;

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  await isRegistered(undefined, `/register?token=${token}`);

  const pending = await redis.get<PendingClient>(`client:${token}`);
  if (!pending) notFound();

  const Form = forms[pending.formId];

  return (
    <main className="mx-auto max-w-md p-6">
      <Form token={token} defaults={pending} />
    </main>
  );
}