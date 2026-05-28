import { Ionicons } from "@expo/vector-icons";
import type { WeeklyStat } from "@weekly-cal/core";
import { Text, View } from "react-native";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "../ui/modal";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

function InfoRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View className="gap-1">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-sm font-bold text-primary">{value}</Text>
      </View>
      {sub && (
        <Text className="text-xs text-muted-foreground leading-4">{sub}</Text>
      )}
    </View>
  );
}

export function WeeklyInfoModal({
  weeklyStat,
  dailyCalorieBudget,
}: {
  weeklyStat: WeeklyStat;
  dailyCalorieBudget: number;
}) {
  const weeklyNet =
    weeklyStat.calorieBudget -
    weeklyStat.caloriesConsumed +
    weeklyStat.caloriesBurned;
  const isOver = weeklyNet < 0;

  return (
    <Modal>
      <ModalTrigger>
        <View className="flex-row items-center gap-1">
          <Text className="text-sm font-medium text-muted-foreground">
            This Week
          </Text>
          <Ionicons
            name="information-circle-outline"
            size={15}
            color="#6b7280"
          />
        </View>
      </ModalTrigger>
      <ModalContent height="auto">
        <View className="px-5 pt-5 pb-4 border-b border-border">
          <Text className="text-base font-bold text-foreground">
            How Weekly Tracking Works
          </Text>
        </View>

        <View className="px-5 py-5 gap-5">
          {/* Weekly budget */}
          <View className="gap-2">
            <InfoRow
              label="Weekly Budget"
              value={`${fmt(weeklyStat.calorieBudget)} kcal`}
              sub={`Your daily budget (${fmt(dailyCalorieBudget)} kcal) × 7 days. We assume the same plan every day of the week.`}
            />
          </View>

          <View className="h-px bg-border" />

          {/* Missed days */}
          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-foreground">
              Missed a Day?
            </Text>
            <Text className="text-xs text-muted-foreground leading-5">
              If you didn&apos;t log anything on a day, we count 0 consumed for
              that day — treating it as if you stuck to your plan. The weekly
              budget still counts that full day.
            </Text>
          </View>

          <View className="h-px bg-border" />

          {/* Weekly net */}
          <View className="gap-2">
            <InfoRow
              label="Weekly Net"
              value={
                isOver
                  ? `${fmt(-weeklyNet)} kcal over`
                  : `${fmt(weeklyNet)} kcal left`
              }
              sub="The sum of all your daily nets — showing how you're doing across the whole week."
            />
          </View>

          {/* Formula */}
          <View className="bg-muted/50 rounded-xl px-4 py-3">
            <Text className="text-xs font-mono text-foreground leading-5">
              Net = Budget − Consumed + Burned
            </Text>
          </View>
        </View>

        <View className="border-t border-border py-3 items-center">
          <ModalClose>
            <Text className="text-sm font-semibold text-primary">Got it</Text>
          </ModalClose>
        </View>
      </ModalContent>
    </Modal>
  );
}
