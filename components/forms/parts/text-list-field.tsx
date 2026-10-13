"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// a short list of text inputs (e.g. "three things...")
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
    <Field>
      <FieldLabel>{label}</FieldLabel>
      {values.map((v, i) => (
        <Input
          key={i}
          value={v}
          placeholder={`${i + 1}.`}
          onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
        />
      ))}
    </Field>
  );
}