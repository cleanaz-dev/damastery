"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRegistered } from "@/lib/auth-guard";
import { sendEmail } from "@/lib/emails/send";
import { CompleteFormEmail } from "@/lib/emails/templates/complete-form";
import {
  getValidAssignmentByToken,
  completeFormAssignment,
  createFormAssignment,
} from "@/lib/forms/assignments";
import { createCommand, lambda } from "@/lib/aws"; // ensure your lambda client is exported
import { getWebhookUrl } from "@/lib/api";

const NEXT_FORM_KEY = "intake-form";

const schema = z.object({
  answers: z
    .record(z.string(), z.enum(["1", "2", "3", "4", "5"]))
    .refine(
      (a) => Array.from({ length: 25 }, (_, i) => `q${i + 1}`).every((k) => k in a),
      "All 25 statements must be answered"
    ),
  open: z.object({
    reach: z.array(z.string().max(300)).max(3),
    story: z.string().trim().min(10, "Say a bit more").max(1000),
    first: z.string().trim().min(10, "Say a bit more").max(1000),
    want: z.string().trim().min(10, "Say a bit more").max(1000),
  }),
  fit: z.object({
    support: z.enum(["Yes", "No"]),
    heavy: z.enum(["Yes", "Not sure", "No"]),
    ack: z.literal(true),
  }),
});

export type BaselineAuditResult = { error: string } | undefined;

export async function submitBaselineAuditForm(
  token: string,
  payload: unknown
): Promise<BaselineAuditResult> {
  // 1. Validate payload shape first (zero I/O on invalid submit)
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  // 2. Verify Session & Assignment in parallel
  const [session, assignment] = await Promise.all([
    isRegistered(token),
    getValidAssignmentByToken(token, "baseline-audit"),
  ]);

  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  if (!assignment) {
    return { error: "This link is invalid, already completed, or has expired." };
  }

  // Guard against mismatched accounts
  if (session.user.email.toLowerCase() !== assignment.email.toLowerCase()) {
    return {
      error: `This form was assigned to ${assignment.email}. Please switch accounts to continue.`,
    };
  }

  // 3. Ensure client profile exists
  const profile = await prisma.clientProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // 4. Mark Baseline Audit COMPLETED & insert FormSubmission
  const { submission } = await completeFormAssignment({
    assignmentId: assignment.id,
    profileId: profile.id,
    data: parsed.data,
  });

  // 5. Automatically create/assign the NEXT form ("intake-form") for their dashboard
  let nextAssignment;
  try {
    nextAssignment = await createFormAssignment({
      formKey: NEXT_FORM_KEY,
      email: session.user.email,
      name: session.user.name ?? assignment.name ?? undefined,
      profileId: profile.id,
    });
  } catch (err) {
    console.error("Failed to automatically assign next form:", err);
  }

  // 6. Record System Task & invoke Lambda asynchronously (Fire-and-Forget)
  try {
    const task = await prisma.systemTask.create({
      data: {
        metadata: {
          token,
          userId: session.user.id,
          profileId: profile.id,
          submissionId: submission.id,
          nextAssignmentId: nextAssignment?.id,
        },
      },
    });

    const webhookUrl = getWebhookUrl(task.id);

    const command = createCommand({
      functionName: "damastery-form-check",
      invocationType: "Event", // Async Lambda execution
      payload: {
        data: parsed.data.open,
        webhookUrl,
        taskId: task.id,
        submissionId: submission.id,
      },
    });

    // Actually send the command to AWS
    await lambda.send(command);
  } catch (err) {
    console.error("Failed to enqueue Lambda check:", err);
    // Don't crash user redirect; webhook or background job can reconcile
  }

  // 7. Non-blocking confirmation email
  const firstName = session.user.name?.trim()
    ? session.user.name.trim().split(" ")[0]
    : assignment.name?.trim()
    ? assignment.name.trim().split(" ")[0]
    : "there";

  try {
    await sendEmail({
      to: session.user.email,
      from: process.env.EMAIL_FROM as string,
      subject: "Thank You!",
      react: CompleteFormEmail({
        firstName,
        formName: assignment.form.title,
      }),
    });
  } catch (err) {
    console.error("Confirmation email failed", err);
  }

  redirect("/client/dashboard");
}