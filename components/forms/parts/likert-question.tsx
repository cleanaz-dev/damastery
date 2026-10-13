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
    // Increased vertical padding (py-8) so the questions don't feel clustered
    <Field data-invalid={missing} className={cn("py-6 md:py-8", missing && "bg-red-50/30 px-4 -mx-4 rounded-md")}>
      
      {/* 
        Made the label flex so the number stays at the top if the text wraps. 
        Bumped to text-base/lg, darkened to slate-900, and added bottom margin.
      */}
      <FieldLabel 
        className={cn(
          "flex items-start mb-5 font-medium text-base md:text-lg text-slate-900 leading-relaxed", 
          missing && "text-red-700"
        )}
      >
        <span className="mr-4 mt-0.5 font-mono text-sm font-bold text-slate-400 shrink-0">
          {String(n).padStart(2, "0")}
        </span>
        <span>{text}</span>
      </FieldLabel>

      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as string)}
        // Increased gap slightly for larger screens
        className="grid grid-cols-5 gap-2 md:gap-3"
      >
        {[1, 2, 3, 4, 5].map((v) => {
          const id = `${name}-${v}`;
          return (
            <Label
              key={v}
              htmlFor={id}
              className={cn(
                choiceStyle,
                // Taller hit area (h-14/16), cursor-pointer, and explicit text sizing
                "flex h-14 md:h-16 flex-col items-center justify-center gap-1.5 text-sm md:text-base font-semibold cursor-pointer transition-all"
              )}
            >
              <RadioGroupItem value={String(v)} id={id} />
              {v}
            </Label>
          );
        })}
      </RadioGroup>

      {/* Darkened text, bumped size, increased tracking (letter-spacing) */}
      <div className="flex justify-between mt-3 px-1 font-mono text-[10px] md:text-xs font-semibold uppercase tracking-widest text-slate-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </Field>
  );
}