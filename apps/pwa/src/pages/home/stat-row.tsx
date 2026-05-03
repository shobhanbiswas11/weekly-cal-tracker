import { cn } from "@/lib/utils";

export function StatRow({
  icon,
  label,
  value,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          iconBg,
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 items-baseline justify-between gap-1">
        <span className="truncate text-xs text-muted-foreground">{label}</span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}
