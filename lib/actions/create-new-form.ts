"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export type CreateFormState = {
  error?: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    return {
      error: "The form title must be 100 characters or fewer.",
    };
  }

  const key = slugify(normalizedTitle);

  if (!key) {
    return {
      error: "The title needs at least one letter or number.",
    };
  }

  try {
    await prisma.form.create({
      data: {
        title: normalizedTitle,
        key,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        error: "A form with that title already exists.",
      };
    }

    throw error;
  }

  revalidatePath("/admin/forms");
  redirect("/admin/forms");
}