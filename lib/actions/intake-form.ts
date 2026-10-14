// lib/actions/intake-form.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma"; // adjust to your prisma client path
import { isRegistered } from "@/lib/auth-guard";
import { checkIntakeAnswers } from "@/lib/prompts/intake-form-prompt";
import type { PendingClient } from "@/lib/actions/first-time-contact";
import { sendEmail } from "../emails/send";
import { CompleteFormEmail } from "../emails/templates/complete-form";
import { error } from "console";

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

export type IntakePayload = z.infer<typeof schema>;
export type IntakeResult = { error: string } | undefined;

export async function submitIntake(
  token: string,
  payload: unknown
): Promise<IntakeResult> {
  const startedAt = Date.now();
  const tag = `[intake:${token.slice(0, 6)}]`;
  const log = (msg: string, extra?: Record<string, unknown>) =>
    console.log(`${tag} ${msg}`, extra ?? "");
  const logError = (msg: string, extra?: unknown) =>
    console.error(`${tag} ${msg}`, extra ?? "");

  log("submitIntake started");

  // --- Auth ---
  const session = await isRegistered(token);

  if (!session?.user?.id) {
    logError("Unauthorized: no valid session for token");
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;
  log("Session verified", { userId });

  // --- User lookup ---
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user || !user.email) {
    logError("User record not found or missing email", { userId });
    return { error: "User record not found." };
  }
  log("User record loaded", { userId });

  // --- Pending token check ---
  const pending = await redis.get<PendingClient>(`client:${token}`);
  if (!pending) {
    logError("Pending client not found in Redis (link expired?)", { userId });
    return { error: "This link has expired." };
  }
  log("Pending client found", { userId, formId: pending.formId });

  // --- Validation ---
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    logError("Schema validation failed", {
      userId,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }
  const data = parsed.data;
  log("Payload validated", { userId });

  // --- AI check on written answers ---
  const check = await checkIntakeAnswers(data.open);
  if (!check.ok) {
    logError("Written answers rejected by checkIntakeAnswers", {
      userId,
      reason: check.reason,
    });
    return {
      error: check.reason || "Please give real answers in the written section.",
    };
  }
  log("Written answers passed check", { userId });

  // --- Profile + submission ---
  const profile = await prisma.clientProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
  log("Client profile upserted", { userId, profileId: profile.id });

  const submission = await prisma.formSubmission.create({
    data: {
      profileId: profile.id,
      formSlug: pending.formId,
      data,
      formId: "cmv7fl6nl0000m33sra794jqp",
    },
  });
  log("Form submission created", {
    userId,
    profileId: profile.id,
    submissionId: submission.id,
    formSlug: pending.formId,
  });

  // --- Cleanup token ---
  await redis.del(`client:${token}`);
  log("Pending token deleted from Redis", { userId });

  // --- Confirmation email ---
  const firstName = user.name.split(" ")[0];
  const form = await prisma.form.findUnique({
    where: {
      id: "cmv7fl6nl0000m33sra794jqp"
    }
  })

  if (!form || !form.title) {
    return { error: "This form has no title" };
  }

  const formName = form?.title

  try {
    await sendEmail({
      to: user.email,
      from: process.env.EMAIL_FROM as string,
      subject: "Thank You!",
      react: CompleteFormEmail({ firstName, formName }),
    });
    log("Confirmation email sent", { userId, formName });
  } catch (err) {
    logError("Failed to send confirmation email", err);
    throw err; // same behavior as before; remove this line if you'd rather still redirect
  }

  log("submitIntake complete, redirecting to /dashboard", {
    userId,
    durationMs: Date.now() - startedAt,
  });

  // redirect() works by throwing, so keep it outside any try/catch
  redirect(`/client/dashboard`);
}