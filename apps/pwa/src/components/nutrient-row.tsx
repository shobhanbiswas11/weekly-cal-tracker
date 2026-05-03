import { Progress } from "@/components/ui/progress";
import { clamp, cn, fmt } from "@/lib/utils";

export function NutrientRow({
  icon,
  label,
  consumed,
  target,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target > 0 ? clamp((consumed / target) * 100, 0, 100) : 0;
  const over = consumed > target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded",
              color,
            )}
          >
            {icon}
          </span>
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-baseline gap-1 tabular-nums text-muted-foreground">
          <span className={cn("font-semibold", over && "text-destructive")}>
            {fmt(consumed)}
          </span>
          <span className="text-xs">
            / {fmt(target)} {unit}
          </span>
        </div>
      </div>
      <Progress
        value={pct}
        indicatorClassName={cn(
          over
            ? "bg-destructive"
            : pct > 85
              ? "bg-amber-500"
              : color.includes("blue")
                ? "bg-blue-500"
                : color.includes("amber")
                  ? "bg-amber-500"
                  : color.includes("orange")
                    ? "bg-orange-500"
                    : color.includes("green")
                      ? "bg-emerald-500"
                      : color.includes("violet")
                        ? "bg-violet-500"
                        : "bg-primary",
        )}
      />
    </div>
  );
}
