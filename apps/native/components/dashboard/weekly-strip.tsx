import { getTodayISO, type DailyStat } from "@weekly-cal/core";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BAR_HEIGHT = 48;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

export function WeeklyStrip({
  weekDates,
  dailyStats,
}: {
  weekDates: string[];
  dailyStats: DailyStat[];
}) {
  const today = getTodayISO();
  const calorieBudget = dailyStats[0]?.calorieBudget ?? 0;
  const primaryColor = useCSSVariable("--color-primary") as string;
  const borderColor = useCSSVariable("--color-border") as string;

  return (
    <View className="flex-row gap-1">
      {weekDates.map((date, i) => {
        const stat = dailyStats.find((d) => d.date === date);
        const isToday = date === today;
        const isFuture = date > today;
        const effectiveCalories = stat?.caloriesConsumed ?? 0;
        const pct =
          calorieBudget > 0
            ? clamp(effectiveCalories / calorieBudget, 0, 1)
            : 0;
        const over = effectiveCalories > calorieBudget;

        const barColor = isFuture
          ? borderColor
          : over
            ? "#ef4444"
            : pct > 0.85
              ? "#fbbf24"
              : primaryColor;

        return (
          <View
            key={date}
            className={`flex-1 items-center gap-1.5 py-2 px-0.5 rounded-lg ${
              isToday ? "bg-primary/10" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-[9px] font-semibold uppercase ${
                isToday ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {DAY_LABELS[i]}
            </Text>
            {/* Bar track */}
            <View
              className="w-full rounded bg-border overflow-hidden justify-end"
              style={{ height: BAR_HEIGHT }}
            >
              <View
                className="w-full rounded"
                style={{
                  height: Math.round(pct * BAR_HEIGHT),
                  backgroundColor: barColor,
                }}
              />
            </View>
            <Text
              className={`text-[8px] font-medium ${
                isToday ? "text-primary" : "text-muted-foreground"
              } ${isFuture ? "opacity-40" : ""}`}
            >
              {isFuture ? "–" : fmt(effectiveCalories)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
