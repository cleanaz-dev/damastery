import { BaseLineAudit } from "@/components/forms/base-line-audit";
import { IntakeForm } from "@/components/forms/intake-form";
import { PendingClient } from "@/lib/actions/first-time-contact";
import { isRegistered } from "@/lib/auth-guard";
import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

const forms = {
  "baseline-audit": BaseLineAudit,
  intake: IntakeForm,
} as const;

type FormId = keyof typeof forms;

function isFormId(id: string): id is FormId {
  return Object.prototype.hasOwnProperty.call(forms, id);
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  await isRegistered(undefined, `/register?token=${token}`);

  const pending = await redis.get<PendingClient>(`client:${token}`);
  if (!pending || !isFormId(pending.formId)) notFound();

  const Form = forms[pending.formId];

  return (
    <div className="min-h-screen bg-[#F6F5F2] selection:bg-slate-200">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24 font-sans text-slate-900">
        <Form token={token} defaults={pending} />
      </main>
    </div>
  );
}