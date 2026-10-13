export function FormSection({
  step,
  title,
  sub,
  children,
}: {
  step: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-baseline gap-3 border-b bg-secondary px-5 py-4">
        <span className="rounded border bg-background px-2 py-0.5 font-mono text-xs font-semibold text-primary">
          {step}
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {sub && <p className="text-sm italic text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}