"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { choiceStyle } from "./choice-style";

// pill-style single choice (Yes / No / Not sure)
export function ChoiceField({
  name,
  label,
  options,
  value,
  onChange,
  showError,
}: {
  name: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  showError?: boolean;
}) {
  const invalid = showError && !value;
  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as string)}
        className="flex flex-wrap gap-2"
      >
        {options.map((o) => {
          const id = `${name}-${o}`;
          return (
            <Label
              key={o}
              htmlFor={id}
              className={cn(choiceStyle, "flex items-center gap-2 px-4 py-2 text-sm")}
            >
              <RadioGroupItem value={o} id={id} />
              {o}
            </Label>
          );
        })}
      </RadioGroup>
      {invalid && <FieldError>Required</FieldError>}
    </Field>
  );
}