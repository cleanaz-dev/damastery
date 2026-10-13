// lib/actions/intake-form.ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma"; // adjust to your prisma client path
import { isRegistered } from "@/lib/auth-guard";
import { checkIntakeAnswers } from "@/lib/prompts/intake-form-prompt";
import type { PendingClient } from "@/lib/actions/first-time-contact";

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
  const session = await isRegistered(token);

  const pending = await redis.get<PendingClient>(`client:${token}`);
  if (!pending) return { error: "This link has expired." };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }
  const data = parsed.data;

  const check = await checkIntakeAnswers(data.open);
  if (!check.ok) {
    return { error: check.reason || "Please give real answers in the written section." };
  }

  const profile = await prisma.clientProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  await prisma.formSubmission.create({
    data: {
      profileId: profile.id,
      formSlug: pending.formId,
      data,
    },
  });

  await redis.del(`client:${token}`);

  redirect(`/client/${profile.id}`); // change to your real route
}