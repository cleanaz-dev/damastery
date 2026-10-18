"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isRegistered } from "@/lib/auth-guard";
import { checkIntakeAnswers } from "@/lib/prompts/intake-form-prompt";
import { sendEmail } from "@/lib/emails/send";
import { CompleteFormEmail } from "@/lib/emails/templates/complete-form";
import {
  getValidAssignmentByToken,
  completeFormAssignment,
} from "@/lib/forms/assignments";

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

export async function submitBaselineAuditForm(
  token: string,
  payload: unknown
) {
  // 1. Validate payload shape first
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  // 2. Verify Session & Assignment simultaneously
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

  // 3. AI verification
  const check = await checkIntakeAnswers(parsed.data.open);
  if (!check.ok) {
    return { error: check.reason || "Please give real answers in the written section." };
  }

  // 4. Ensure client profile exists
  const profile = await prisma.clientProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // 5. Transaction: Mark FormAssignment COMPLETED & insert FormSubmission
  await completeFormAssignment({
    assignmentId: assignment.id,
    profileId: profile.id,
    data: parsed.data,
  });

  // 6. Confirmation Email
  try {
    await sendEmail({
      to: session.user.email,
      from: process.env.EMAIL_FROM as string,
      subject: "Thank You!",
      react: CompleteFormEmail({
        firstName: session.user.name.split(" ")[0],
        formName: assignment.form.title,
      }),
    });
  } catch (err) {
    console.error("Confirmation email failed", err);
  }

  redirect("/client/dashboard");
}