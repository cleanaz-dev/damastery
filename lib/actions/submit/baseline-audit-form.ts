// lib/actions/submit/baseline-audit-form.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { isRegistered } from "@/lib/auth-guard";
import { checkIntakeAnswers } from "@/lib/prompts/intake-form-prompt";
import type { PendingClient } from "@/lib/actions/first-time-contact";
import { sendEmail } from "@/lib/emails/send";
import { CompleteFormEmail } from "@/lib/emails/templates/complete-form";

const EXPECTED_FORM_KEY = "baseline-audit";

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

export type BaselineAuditPayload = z.infer<typeof schema>;
export type BaselineAuditResult = { error: string } | undefined;

export async function submitBaselineAuditForm(
  token: string,
  payload: unknown
): Promise<BaselineAuditResult> {
  const tag = `[${EXPECTED_FORM_KEY}:${token.slice(0, 6)}]`;

  // 1. Validate schema first (Zero I/O cost if payload is invalid)
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  // 2. Verify Auth & Redis Token in parallel
  const [session, pending] = await Promise.all([
    isRegistered(token),
    redis.get<PendingClient>(`client:${token}`),
  ]);

  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  if (!pending || pending.formKey !== EXPECTED_FORM_KEY) {
    return { error: "This link is invalid or has expired." };
  }

  const { id: userId, name, email } = session.user;

  // 3. AI Check on written answers
  const check = await checkIntakeAnswers(parsed.data.open);
  if (!check.ok) {
    console.warn(`${tag} AI check rejected`, { userId, reason: check.reason });
    return {
      error: check.reason || "Please give real answers in the written section.",
    };
  }

  // 4. Upsert ClientProfile + Create Submission in a single query via nested connectOrCreate
  await prisma.formSubmission.create({
    data: {
      formSlug: pending.formKey,
      data: parsed.data,
      form: { connect: { id: pending.formId } },
      profile: {
        connectOrCreate: {
          where: { userId },
          create: { userId },
        },
      },
    },
  });

  // 5. Clean up Redis & Send Email (non-blocking if email fails)
  await redis.del(`client:${token}`);

  try {
    await sendEmail({
      to: email,
      from: process.env.EMAIL_FROM as string,
      subject: "Thank You!",
      react: CompleteFormEmail({
        firstName: name.split(" ")[0],
        formName: pending.formTitle,
      }),
    });
  } catch (err) {
    // Log email error, but don't throw — the submission is already saved & token is deleted!
    console.error(`${tag} Confirmation email failed`, { userId, err });
  }

  console.info(`${tag} Submitted successfully`, { userId });
  redirect("/client/dashboard");
}