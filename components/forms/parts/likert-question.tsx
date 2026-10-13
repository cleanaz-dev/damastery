"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { choiceStyle } from "./choice-style";

// 1–5 scale
export function LikertQuestion({
  name,
  n,
  text,
  value,
  onChange,
  missing,
  lowLabel = "Not true of me",
  highLabel = "Completely true",
}: {
  name: string;
  n: number;
  text: string;
  value: string;
  onChange: (v: string) => void;
  missing?: boolean;
  lowLabel?: string;
  highLabel?: string;
}) {
  return (
    <Field data-invalid={missing} className="py-4">
      <FieldLabel className={cn("font-normal leading-snug", missing && "text-destructive")}>
        <span className="mr-2 font-mono text-xs text-muted-foreground">
          {String(n).padStart(2, "0")}
        </span>
        {text}
      </FieldLabel>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as string)}
        className="grid grid-cols-5 gap-2"
      >
        {[1, 2, 3, 4, 5].map((v) => {
          const id = `${name}-${v}`;
          return (
            <Label
              key={v}
              htmlFor={id}
              className={cn(
                choiceStyle,
                "flex h-12 flex-col items-center justify-center gap-1 text-sm"
              )}
            >
              <RadioGroupItem value={String(v)} id={id} />
              {v}
            </Label>
          );
        })}
      </RadioGroup>

      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </Field>
  );
}