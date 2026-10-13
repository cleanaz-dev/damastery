"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function AckField({
  id,
  checked,
  onChange,
  showError,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  showError?: boolean;
  children: React.ReactNode;
}) {
  const invalid = showError && !checked;
  return (
    <Field
      orientation="horizontal"
      data-invalid={invalid}
      className={cn(
        "items-start rounded-md border bg-secondary p-4",
        invalid && "border-destructive"
      )}
    >
      <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(c === true)} />
      <Label htmlFor={id} className="text-sm font-normal leading-snug">
        {children}
      </Label>
    </Field>
  );
}