// lib/forms/registry.ts
import type { ComponentType } from "react";
import { IntakeForm } from "@/components/forms/intake-form";

export type FormComponentProps = {
  token: string;
  defaults: Record<string, unknown>;
};

export const formRegistry = {
  intake: IntakeForm,
} satisfies Record<string, ComponentType<FormComponentProps>>;

export type FormKey = keyof typeof formRegistry;

export function isFormKey(value: string): value is FormKey {
  return value in formRegistry;
}