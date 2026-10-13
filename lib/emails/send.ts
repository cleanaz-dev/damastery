import "server-only";
import type { ReactElement } from "react";
import { resend } from "@/lib/resend";

const DEFAULT_FROM = process.env.EMAIL_FROM ?? "Acme <onboarding@resend.dev>";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string | string[];
};

export async function sendEmail({
  to,
  subject,
  react,
  from = DEFAULT_FROM,
  replyTo,
}: SendEmailParams) {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
    replyTo,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}