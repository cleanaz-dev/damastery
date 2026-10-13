// app/forms/[token]/page.tsx
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
    // Added a subtle warm off-white background matching your screenshot
    <div className="min-h-screen bg-[#F6F5F2] selection:bg-slate-200">
      {/* Changed max-w-md to max-w-3xl for a much wider, readable layout */}
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24 font-sans text-slate-900">
        <Form token={token} defaults={pending} />
      </main>
    </div>
  );
}