import { BaseLineAudit } from "@/components/forms/base-line-audit";
import { IntakeForm } from "@/components/forms/intake-form";
import { PendingClient } from "@/lib/actions/first-time-contact";
import { ComponentType } from "react";

export type FormProps = {
  token: string;
  defaults: PendingClient;
};

// Keys here must match the `key` column in your Prisma `Form` table
export const formComponents: Record<string, ComponentType<FormProps>> = {
  "baseline-audit": BaseLineAudit,
  "intake-form": IntakeForm,
};