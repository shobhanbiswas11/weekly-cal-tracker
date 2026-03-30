// Weekly bar graph showing daily calories

import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import type { DailySummary } from "../types";
import { DEFAULT_GOALS } from "../types";
import { getDayName, isToday } from "../utils";

interface WeeklyGraphProps {
  days: DailySummary[];
  dailyGoal?: number;
  className?: string;
}

export function WeeklyGraph({
  days,
  dailyGoal = DEFAULT_GOALS.dailyCalorieGoal,
  className,
}: WeeklyGraphProps) {
  const navigate = useNavigate();

  // Find max value for scaling
  const maxCalories = Math.max(
    ...days.map((d) => d.totals.calories),
    dailyGoal * 1.2, // Ensure goal line is visible
  );

  const handleBarClick = (date: string) => {
    navigate(`/daily?date=${date}`);
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl ring-1 ring-foreground/10 p-4",
        className,
      )}
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Daily Breakdown
      </h3>

      <div className="relative">
        {/* Goal line */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30"
          style={{ bottom: `${(dailyGoal / maxCalories) * 100}%` }}
        >
          <span className="absolute right-0 -top-4 text-xs text-muted-foreground">
            {dailyGoal.toLocaleString()}
          </span>
        </div>

        {/* Bars */}
        <div className="flex items-end justify-between gap-1 h-32 pb-6">
          {days.map((day) => {
            const height = (day.totals.calories / maxCalories) * 100;
            const isTodayBar = isToday(day.date);
            const hasEntries = day.entries.length > 0;
            const isOverGoal = day.totals.calories > dailyGoal;

            return (
              <button
                key={day.date}
                onClick={() => handleBarClick(day.date)}
                className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="relative w-full flex justify-center">
                  {hasEntries && (
                    <span className="absolute -top-5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.totals.calories}
                    </span>
                  )}
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t-md transition-all group-hover:opacity-80",
                      hasEntries
                        ? isOverGoal
                          ? "bg-red-500"
                          : isTodayBar
                            ? "bg-primary"
                            : "bg-primary/60"
                        : "bg-muted",
                    )}
                    style={{
                      height: hasEntries ? `${Math.max(height, 4)}%` : "4px",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex justify-between mt-1">
          {days.map((day) => (
            <div
              key={day.date}
              className={cn(
                "flex-1 text-center text-xs",
                isToday(day.date)
                  ? "text-primary font-medium"
                  : "text-muted-foreground",
              )}
            >
              {getDayName(day.date, true).charAt(0)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
