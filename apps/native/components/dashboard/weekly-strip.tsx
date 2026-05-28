import { getTodayISO, type DailyStat } from "@weekly-cal/core";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "../ui/modal";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BAR_HEIGHT = 48;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function StatRow({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: string;
}) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-border">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text
        className={`text-sm font-semibold ${valueStyle ?? "text-foreground"}`}
      >
        {value}
      </Text>
    </View>
  );
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

        const dayBar = (
          <View
            className={`items-center gap-1.5 py-2 px-0.5 rounded-lg ${
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

        if (isFuture) {
          return (
            <View key={date} style={{ flex: 1 }}>
              {dayBar}
            </View>
          );
        }

        const consumed = stat?.caloriesConsumed ?? 0;
        const burned = stat?.caloriesBurned ?? 0;
        const net = calorieBudget - consumed + burned;
        const isOver = net < 0;

        return (
          <View key={date} style={{ flex: 1 }}>
            <Modal>
              <ModalTrigger>{dayBar}</ModalTrigger>
              <ModalContent height="auto">
                <View className="px-5 pt-5 pb-4 border-b border-border">
                  <Text className="text-base font-bold text-foreground">
                    {formatDate(date)}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">
                    Daily summary
                  </Text>
                </View>
                <View className="px-5 pt-1">
                  <StatRow
                    label="Budget"
                    value={`${fmt(calorieBudget)} kcal`}
                  />
                  <StatRow label="Eaten" value={`${fmt(consumed)} kcal`} />
                  <StatRow
                    label="Burned"
                    value={`${fmt(burned)} kcal`}
                    valueStyle="text-primary"
                  />
                  <View className="flex-row justify-between items-center py-3">
                    <Text className="text-sm font-semibold text-foreground">
                      {isOver ? "Over" : "Left"}
                    </Text>
                    <Text
                      className={`text-sm font-bold ${isOver ? "text-red-500" : "text-primary"}`}
                    >
                      {fmt(Math.abs(net))} kcal
                    </Text>
                  </View>
                </View>
                <View className="border-t border-border py-3 items-center">
                  <ModalClose>
                    <Text className="text-sm font-semibold text-primary">
                      Close
                    </Text>
                  </ModalClose>
                </View>
              </ModalContent>
            </Modal>
          </View>
        );
      })}
    </View>
  );
}
