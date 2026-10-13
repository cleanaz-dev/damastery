// components/forms/parts/choice-field.tsx
"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

// Make the pills bolder and darker
export const choiceStyle =
  "cursor-pointer rounded-md border-2 border-stone-200 bg-white font-bold text-stone-700 hover:border-stone-900 has-data-checked:border-stone-900 has-data-checked:bg-stone-900 has-data-checked:text-white transition-all";

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
    <Field data-invalid={invalid} className="space-y-4">
      {/* Forced FieldLabel to be larger */}
      <FieldLabel className="text-lg md:text-xl font-semibold text-stone-950 leading-snug">
        {label}
      </FieldLabel>
      
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as string)}
        className="flex flex-wrap gap-3 md:gap-4"
      >
        {options.map((o) => {
          const id = `${name}-${o}`;
          return (
            <Label
              key={o}
              htmlFor={id}
              // Increased padding and text size (text-base -> text-lg)
              className={cn(choiceStyle, "flex items-center gap-3 px-6 py-4 text-base md:text-lg")}
            >
              <RadioGroupItem value={o} id={id} className="scale-125" />
              {o}
            </Label>
          );
        })}
      </RadioGroup>
      {invalid && <FieldError className="text-red-600 font-bold text-sm">Required</FieldError>}
    </Field>
  );
}