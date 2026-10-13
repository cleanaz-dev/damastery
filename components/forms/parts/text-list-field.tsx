// components/forms/parts/text-list-field.tsx
"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function TextListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Field className="space-y-4">
      {/* Darkened and enlarged label */}
      <FieldLabel className="text-lg md:text-xl font-bold text-stone-950 leading-snug block">
        {label}
      </FieldLabel>
      
      <div className="space-y-3">
        {values.map((v, i) => (
          <Input
            key={i}
            value={v}
            placeholder={`${i + 1}.`}
            onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
            className="text-base md:text-lg p-6 border-2 border-stone-200 focus:border-stone-900 rounded-md transition-colors"
          />
        ))}
      </div>
    </Field>
  );
}