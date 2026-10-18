import { getValidAssignmentByToken } from "@/lib/forms/assignments";
import { formComponents } from "@/lib/forms/registry";
import { isRegistered } from "@/lib/auth-guard";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // 1. Fetch & validate assignment via DB helper
  const assignment = await getValidAssignmentByToken(token);
  if (!assignment) {
    console.error("[404 DEBUG] Assignment lookup failed for token:", token);
    notFound();
  }

  // 2. Verify component exists in your frontend code map
  const FormComponent = formComponents[assignment.form.key];
  if (!FormComponent) {
    console.error(
      `[404 DEBUG] FormComponent missing for form.key: "${assignment.form.key}". Available keys:`,
      Object.keys(formComponents)
    );
    notFound();
  }

  // 3. User must be registered/authenticated to submit
  await isRegistered(undefined, `/register?token=${token}`);

  return (
    <div className="min-h-screen bg-[#F6F5F2] selection:bg-slate-200">
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24 font-sans text-slate-900">
        <FormComponent
          token={token}
          defaults={{
            name: assignment.name ?? "",
            email: assignment.email,
            message: assignment.message ?? "",
            formId: assignment.formId, 
            formKey: assignment.form.key,
            formTitle: assignment.form.title,
          }}
        />
      </main>
    </div>
  );
}
