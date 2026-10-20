// lib/actions/check-required-forms.ts
// Server-only helper. Do NOT add "use server" to this file and do NOT
// import it from a client component.

import { prisma } from "../prisma";
import { REQUIRED_FORMS, getMissingRequiredForms } from "@/lib/forms/required-forms";

export async function checkRequiredForms(userId: string) {
  const submissions = await prisma.formSubmission.findMany({
    where: {
      profile: { userId },
      form: { key: { in: REQUIRED_FORMS.map((f) => f.key) } },
    },
    select: { form: { select: { key: true } } },
  });

  const missing = getMissingRequiredForms(submissions.map((s) => s.form.key));

  return { ok: missing.length === 0, missing };
}