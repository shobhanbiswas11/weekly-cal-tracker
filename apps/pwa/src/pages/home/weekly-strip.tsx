import { clamp, cn, fmt } from "@/lib/utils";
import { getTodayISO, type DailyStat } from "@weekly-cal/core";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyStrip({
  weekDates,
  dailyStats,
}: {
  weekDates: string[];
  dailyStats: DailyStat[];
}) {
  const today = getTodayISO();
  const calorieBudget = dailyStats[0]?.calorieBudget ?? 0;

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDates.map((date, i) => {
        const stat = dailyStats.find((d) => d.date === date);
        const isToday = date === today;
        const isFuture = date > today;

        // Domain already handles past-day projection; future days have no stat
        const effectiveCalories = stat?.caloriesConsumed ?? 0;

        const pct =
          calorieBudget > 0
            ? clamp(effectiveCalories / calorieBudget, 0, 1)
            : 0;
        const over = effectiveCalories > calorieBudget;

        const barColor = isFuture
          ? "bg-muted"
          : over
            ? "bg-destructive"
            : pct > 0.85
              ? "bg-amber-400"
              : "bg-emerald-500";

        return (
          <div
            key={date}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg px-1 py-2",
              isToday && "bg-primary/8 ring-1 ring-primary/30",
            )}
          >
            <span
              className={cn(
                "text-[10px] font-semibold uppercase",
                isToday ? "text-primary" : "text-muted-foreground",
              )}
            >
              {DAY_LABELS[i]}
            </span>
            {/* Bar */}
            <div className="relative h-12 w-full overflow-hidden rounded-sm bg-muted">
              <div
                className={cn(
                  "absolute bottom-0 w-full rounded-sm transition-all duration-500",
                  barColor,
                )}
                style={{ height: `${Math.round(pct * 100)}%` }}
              />
            </div>
            <span
              className={cn(
                "text-[9px] tabular-nums font-medium",
                isToday ? "text-primary" : "text-muted-foreground",
                isFuture && "opacity-40",
              )}
            >
              {isFuture ? "–" : fmt(effectiveCalories)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
