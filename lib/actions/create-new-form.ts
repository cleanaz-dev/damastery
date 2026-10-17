"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export type CreateFormState = {
  error?: string;
};

export async function createNewForm(
  _previousState: CreateFormState,
  formData: FormData,
): Promise<CreateFormState> {
  await requireAdmin();

  const title = formData.get("title");

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Please enter a form title." };
  }

  const normalizedTitle = title.trim();

  if (normalizedTitle.length > 100) {
    return { error: "The form title must be 100 characters or fewer." };
  }

  const form = await prisma.form.create({
    data: {
      title: normalizedTitle,
    },
  });

  revalidatePath("/admin/forms");
  redirect(`/admin/forms/${form.id}`);
}