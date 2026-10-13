"use server";

import { redirect } from "next/navigation";
import { redis } from "@/lib/redis";
import { sendEmail } from "@/lib/emails/send";
import { FirstContactEmail } from "@/lib/emails/templates/first-contact";

const FORM_IDS = ["intake"] as const; // add form ids here
export type FormId = (typeof FORM_IDS)[number];

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type PendingClient = {
  name: string;
  email: string;
  message: string;
  formId: FormId;
};

export type FirstContactState = { error?: string };

export async function firstContactAction(
  _prev: FirstContactState,
  formData: FormData,
): Promise<FirstContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();
  const formId = String(formData.get("formId") ?? "intake") as FormId;

  if (!name || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please fill in your name, a valid email, and a message." };
  }
  if (!FORM_IDS.includes(formId)) {
    return { error: "Something went wrong. Please try again." };
  }

  // No client exists yet, so this is just an unguessable token for the URL.
  const token = crypto.randomUUID();
  const pending: PendingClient = { name, email, message, formId };
  await redis.set(`client:${token}`, pending, { ex: TTL_SECONDS });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/client/form/${token}`;

  // Email is a backup link. If it fails, they still get redirected below.
  try {
    await sendEmail({
      to: email,
      subject: "Continue your questionnaire",
      react: FirstContactEmail({ name: name.split(" ")[0], url }),
    });
  } catch (err) {
    console.error("first-contact email failed", err);
  }

  // redirect() throws internally, so keep it outside any try/catch.
  redirect("/thank-you");
}