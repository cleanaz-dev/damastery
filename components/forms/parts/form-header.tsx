// components/forms/parts/form-header.tsx
import { ReactNode } from "react";

export function FormHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="space-y-4 pb-6">
      {eyebrow && (
        <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-stone-950">
        {title}
      </h1>
      {/* THE FIX: Removed the <p text-muted-foreground> wrapper so your text stays large and dark! */}
      {children && <div className="pt-2">{children}</div>}
    </header>
  );
}