// components/forms/parts/form-section.tsx
import { ReactNode } from "react";

export function FormSection({
  step,
  title,
  sub,
  children,
}: {
  step: string;
  title: string;
  sub: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
      {/* UPDATED: bg-slate-900 for high contrast */}
      <div className="bg-slate-900 px-6 py-5 flex flex-col md:flex-row md:items-center gap-5">
        <span className="bg-white text-slate-900 font-bold px-3 py-1 text-sm md:text-base rounded-sm shadow-sm flex-shrink-0">
          {step}
        </span>
        <div>
          {/* UPDATED: text-white so it pops out from the dark blue/slate */}
          <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
            {title}
          </h2>
          {/* UPDATED: text-slate-300 so the subtext is legible */}
          <p className="text-sm md:text-base text-slate-300 font-medium mt-0.5 italic">
            {sub}
          </p>
        </div>
      </div>
      
      {/* Form Content */}
      <div className="bg-white">
        {children}
      </div>
    </section>
  );
}