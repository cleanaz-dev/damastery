import { Progress } from "@/components/ui/progress";

export function FormProgress({ done, total }: { done: number; total: number }) {
  return (
    <div className="sticky top-0 z-10 -mx-1 bg-background px-1 py-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="font-mono tabular-nums">
          {done} / {total}
        </span>
        <Progress value={(done / total) * 100} className="flex-1" />
      </div>
    </div>
  );
}