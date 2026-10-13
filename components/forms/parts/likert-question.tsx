// components/forms/parts/likert-question.tsx
"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { choiceStyle } from "./choice-style";

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
    <div className={cn("py-8 md:py-10 border-b border-stone-300", missing && "bg-red-50/50 p-4 rounded-md")}>
      
      {/* QUESTION TITLE: Forced large text and high contrast */}
      <div className="flex items-start gap-4 mb-6">
        <span className="font-mono text-base md:text-lg font-bold text-stone-500 mt-0.5 shrink-0">
          {String(n).padStart(2, "0")}
        </span>
        <span className={cn(
          "text-lg md:text-2xl font-bold text-stone-950 leading-snug tracking-tight", 
          missing && "text-red-700"
        )}>
          {text}
        </span>
      </div>

      {/* 1-5 RADIO BUTTONS */}
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as string)}
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
                "flex h-16 md:h-20 flex-col items-center justify-center gap-2 text-base md:text-xl font-bold cursor-pointer transition-all border-2 border-stone-300 hover:border-stone-900"
              )}
            >
              <RadioGroupItem value={String(v)} id={id} className="scale-125" />
              <span>{v}</span>
            </Label>
          );
        })}
      </RadioGroup>

      {/* LABELS: Darkened and bumped up */}
      <div className="flex justify-between mt-4 px-1 font-mono text-xs md:text-sm font-bold uppercase tracking-wider text-stone-700">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}