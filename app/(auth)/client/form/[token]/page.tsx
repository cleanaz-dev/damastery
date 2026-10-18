import { PendingClient } from "@/lib/actions/first-time-contact";
import { formComponents } from "@/lib/forms/registry";
import { isRegistered } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  // 1. Fetch pending invite from Redis first
  const pending = await redis.get<PendingClient>(`client:${token}`);
  if (!pending) notFound();

  // 2. Verify the form is still active in Postgres and has a mapped React component
  const dbForm = await prisma.form.findUnique({
    where: { key: pending.formKey },
    select: { id: true, active: true, key: true },
  });

  const FormComponent = formComponents[pending.formKey];

  if (!dbForm || !dbForm.active || !FormComponent) {
    notFound();
  }

  // 3. Only force registration once we know the token & form are 100% valid
  await isRegistered(undefined, `/register?token=${token}`);

  return (
    <div className="min-h-screen bg-[#F6F5F2] selection:bg-slate-200">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24 font-sans text-slate-900">
        <FormComponent token={token} defaults={pending} />
      </main>
    </div>
  );
}