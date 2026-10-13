export function FormHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="space-y-2">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {children && <p className="text-muted-foreground">{children}</p>}
    </header>
  );
}