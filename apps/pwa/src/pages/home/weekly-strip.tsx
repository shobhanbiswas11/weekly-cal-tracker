import { clamp, cn, fmt } from "@/lib/utils";
import type { MealEntry } from "@weekly-cal/core";
import { getTodayISO } from "@weekly-cal/core";
import { getDayTotals } from "./utils";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyStrip({
  weekDates,
  entries,
  dailyCalorieBudget,
}: {
  weekDates: string[];
  entries: MealEntry[];
  dailyCalorieBudget: number;
}) {
  const today = getTodayISO();

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDates.map((date, i) => {
        const totals = getDayTotals(entries, date);
        const isPast = date < today;
        const isToday = date === today;
        const isFuture = date > today;

        // Rule: past days with no entries → full budget consumed
        const effectiveCalories =
          isPast && totals.count === 0 ? dailyCalorieBudget : totals.calories;

        const pct =
          dailyCalorieBudget > 0
            ? clamp(effectiveCalories / dailyCalorieBudget, 0, 1)
            : 0;
        const over = effectiveCalories > dailyCalorieBudget;

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
