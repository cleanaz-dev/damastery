import { prisma } from "@/lib/prisma";
import { FormAssignment, Form, FormStatus } from "../generated/prisma/client";


const DEFAULT_TTL_DAYS = 7;

export type VerifiedAssignment = FormAssignment & {
  form: Form;
};

/**
 * Creates a new form assignment (replaces your Redis set).
 * Can be called for anonymous leads or registered profiles.
 */
export async function createFormAssignment({
  formKey,
  email,
  name,
  message,
  profileId,
  ttlDays = DEFAULT_TTL_DAYS,
}: {
  formKey: string;
  email: string;
  name?: string;
  message?: string;
  profileId?: string;
  ttlDays?: number;
}) {
  const form = await prisma.form.findUnique({
    where: { key: formKey },
  });

  if (!form || !form.active) {
    throw new Error("Form does not exist or is inactive");
  }

  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

  return prisma.formAssignment.create({
    data: {
      formId: form.id,
      email: email.trim().toLowerCase(),
      name: name?.trim(),
      message: message?.trim(),
      profileId,
      expiresAt,
      status: FormStatus.PENDING,
    },
    include: {
      form: true,
    },
  });
}

/**
 * Validates a token from the URL.
 * Checks for existence, active status, matching form key, and expiration.
 */
export async function getValidAssignmentByToken(
  token: string,
  expectedFormKey?: string
): Promise<VerifiedAssignment | null> {
  const assignment = await prisma.formAssignment.findUnique({
    where: { token },
    include: { form: true },
  });

  if (!assignment) return null;

  // Verify assignment is still pending
  if (assignment.status !== FormStatus.PENDING) return null;

  // Verify expiration
  if (assignment.expiresAt < new Date()) {
    // Optionally update status in the background
    await prisma.formAssignment.update({
      where: { id: assignment.id },
      data: { status: FormStatus.EXPIRED },
    }).catch(() => null);
    return null;
  }

  // Verify form is active
  if (!assignment.form.active) return null;

  // Optional: Verify key matches component route expectations
  if (expectedFormKey && assignment.form.key !== expectedFormKey) {
    return null;
  }

  return assignment;
}

/**
 * Links any pre-registration assignments matching an email address
 * to a newly registered user profile. Call this during/after registration!
 */
export async function linkPendingAssignmentsToProfile(
  email: string,
  profileId: string
) {
  return prisma.formAssignment.updateMany({
    where: {
      email: email.trim().toLowerCase(),
      profileId: null,
      status: FormStatus.PENDING,
    },
    data: { profileId },
  });
}

/**
 * Atomic helper to record a submission and close the assignment.
 */
export async function completeFormAssignment({
  assignmentId,
  profileId,
  data,
}: {
  assignmentId: string;
  profileId: string;
  data: any;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Mark assignment as completed
    const assignment = await tx.formAssignment.update({
      where: { id: assignmentId },
      data: {
        status: FormStatus.COMPLETED,
        profileId, // Ensure profile is linked
      },
      include: { form: true },
    });

    // 2. Insert the actual FormSubmission
    const submission = await tx.formSubmission.create({
      data: {
        assignmentId: assignment.id,
        profileId,
        formId: assignment.formId,
        formSlug: assignment.form.key,
        data,
      },
    });

    return { assignment, submission };
  });
}