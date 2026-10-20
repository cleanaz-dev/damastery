"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";

const DEFAULT_DAYS_VALID = 7;

export async function assignFormToClient(input: {
  userId: string;
  formId: string;
  daysValid?: number;
}) {
  // TODO: verify the caller is an ADMIN (e.g. check your auth session here)

  const { userId, formId, daysValid = DEFAULT_DAYS_VALID } = input;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, error: "Client not found" };

  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form || !form.active) {
    return { ok: false as const, error: "Form not found or inactive" };
  }

  // Make sure the client has a profile (creates one if missing)
  const profile = await prisma.clientProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  // Don't double-assign a form that's still waiting on them
  const existing = await prisma.formAssignment.findFirst({
    where: {
      profileId: profile.id,
      formId,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) {
    return { ok: false as const, error: "This form is already assigned" };
  }

  const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);

  const assignment = await prisma.formAssignment.create({
    data: {
      email: user.email,
      name: user.name,
      formId,
      profileId: profile.id,
      expiresAt,
    },
  });

  revalidatePath("/admin/clients"); // TODO: set to your clients page path

  return { ok: true as const, assignment };
}