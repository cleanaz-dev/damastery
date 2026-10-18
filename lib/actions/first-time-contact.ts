"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emails/send";
import { FirstContactEmail } from "@/lib/emails/templates/first-contact";
import { formComponents } from "@/lib/forms/registry";
import { createFormAssignment } from "@/lib/forms/assignments";

// Hardcoded initial form for all new contact inquiries
const INITIAL_FORM_KEY = "baseline-audit";

export type PendingClient = {
  name: string;
  email: string;
  message: string;
  formId: string;
  formKey: string;
  formTitle: string;
};

export type FirstContactState = { error?: string };

export async function firstContactAction(
  _prev: FirstContactState,
  formData: FormData,
): Promise<FirstContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please fill in your name, a valid email, and a message." };
  }

  // 1. Verify that the baseline audit exists, is active, and is registered in the UI
  const dbForm = await prisma.form.findUnique({
    where: { key: INITIAL_FORM_KEY },
  });

  if (!dbForm || !dbForm.active || !formComponents[INITIAL_FORM_KEY]) {
    return { error: "The audit form is currently unavailable. Please try again later." };
  }

  // 2. Persist the assignment via Postgres
  let assignment;
  try {
    assignment = await createFormAssignment({
      formKey: INITIAL_FORM_KEY,
      email,
      name,
      message,
    });
  } catch (err) {
    console.error("Failed to create form assignment:", err);
    return { error: "Unable to process your request. Please try again." };
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/client/form/${assignment.token}`;

  // 3. Dispatch invitation email
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