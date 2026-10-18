"use server";

import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma"; // adjust to your prisma client import
import { sendEmail } from "@/lib/emails/send";
import { FirstContactEmail } from "@/lib/emails/templates/first-contact";
import { formComponents } from "@/lib/forms/registry";

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type PendingClient = {
  name: string;
  email: string;
  message: string;
  formId: string;    // Prisma Form.id (ready for FormSubmission.formId)
  formKey: string;   // Prisma Form.key (maps to React component & FormSubmission.formSlug)
  formTitle: string; // Prisma Form.title
};

export type FirstContactState = { error?: string };

export async function firstContactAction(
  _prev: FirstContactState,
  formData: FormData,
): Promise<FirstContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  const formKey = String(formData.get("formKey") ?? "").trim();

  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please fill in your name, a valid email, and a message." };
  }

  if (!formKey) {
    return { error: "No form specified." };
  }

  // 1. Check the DB: Does this form exist and is it active?
  const dbForm = await prisma.form.findUnique({
    where: { key: formKey },
  });

  if (!dbForm || !dbForm.active || !formComponents[dbForm.key]) {
    return { error: "This form is currently unavailable. Please try again." };
  }

  // 2. Store the verified form details in Redis
  const token = crypto.randomUUID();
  const pending: PendingClient = {
    name,
    email,
    message,
    formId: dbForm.id,
    formKey: dbForm.key,
    formTitle: dbForm.title,
  };

  await redis.set(`client:${token}`, pending, { ex: TTL_SECONDS });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/client/form/${token}`;

  try {
    await sendEmail({
      to: email,
      subject: `Continue your ${dbForm.title}`,
      react: FirstContactEmail({ name: name.split(" ")[0], url }),
    });
  } catch (err) {
    console.error("first-contact email failed", err);
  }

  redirect("/thank-you");
}