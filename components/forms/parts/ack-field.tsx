// components/forms/parts/ack-field.tsx
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

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
  children: ReactNode;
}) {
  const invalid = showError && !checked;
  return (
    <Field
      orientation="horizontal"
      data-invalid={invalid}
      className={cn(
        "items-start rounded-md border bg-stone-50 p-6 md:p-8",
        invalid && "border-red-500 bg-red-50"
      )}
    >
      <Checkbox 
        id={id} 
        checked={checked} 
        onCheckedChange={(c) => onChange(c === true)} 
        className="mt-1 scale-125"
      />
      {/* Increased to text-lg and darkened to stone-900 */}
      <Label htmlFor={id} className="text-base md:text-lg font-medium leading-relaxed text-stone-900 pl-3">
        {children}
      </Label>
    </Field>
  );
}