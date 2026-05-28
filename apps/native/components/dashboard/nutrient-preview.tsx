import type { MealEntry } from "@weekly-cal/core";
import { ScrollView, Text, View } from "react-native";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "../ui/modal";

type NutrientKey = "protein" | "carbs" | "fats" | "fiber" | "sodium";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

function getMacroValue(meal: MealEntry, key: NutrientKey): number {
  switch (key) {
    case "protein":
      return meal.protein;
    case "carbs":
      return meal.carbs;
    case "fats":
      return meal.fats;
    case "fiber":
      return meal.fiber;
    case "sodium":
      return meal.sodium;
  }
}

export function NutrientPreview({
  nutrientKey,
  label,
  unit,
  color,
  consumed,
  target,
  meals,
}: {
  nutrientKey: NutrientKey;
  label: string;
  unit: string;
  color: string;
  consumed: number;
  target: number;
  meals: MealEntry[];
}) {
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const over = consumed > target;

  const sorted = [...meals].sort(
    (a, b) => getMacroValue(b, nutrientKey) - getMacroValue(a, nutrientKey),
  );
  const total = meals.reduce(
    (sum, m) => sum + getMacroValue(m, nutrientKey),
    0,
  );

  return (
    <Modal>
      <ModalTrigger>
        {/* NutrientRow */}
        <View className="gap-1.5">
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-medium text-foreground">{label}</Text>
            <Text
              className={`text-xs ${over ? "text-red-500" : "text-muted-foreground"}`}
            >
              {fmt(consumed)}
              {unit} / {fmt(target)}
              {unit}
            </Text>
          </View>
          <View className="h-1.25 bg-border rounded-full overflow-hidden">
            <View
              className="h-1.25 rounded-full"
              style={{
                width: `${Math.round(pct * 100)}%`,
                backgroundColor: over ? "#ef4444" : color,
              }}
            />
          </View>
        </View>
      </ModalTrigger>

      <ModalContent height="auto">
        <View className="px-5 pt-5 pb-4 border-b border-border">
          <Text className="text-base font-bold text-foreground">
            {label} Sources
          </Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Today&apos;s meals — sorted by contribution
          </Text>
        </View>

        {meals.length === 0 ? (
          <View className="px-5 py-8 items-center">
            <Text className="text-sm text-muted-foreground text-center">
              No meals logged today.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ padding: 20, gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            {sorted.map((meal) => {
              const value = getMacroValue(meal, nutrientKey);
              const mealPct = total > 0 ? value / total : 0;
              return (
                <View key={meal.id} className="gap-1.5">
                  <View className="flex-row justify-between items-center">
                    <Text
                      className="text-sm font-medium text-foreground flex-1 mr-3"
                      numberOfLines={1}
                    >
                      {meal.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {fmt(value)}
                      {unit}
                    </Text>
                  </View>
                  <View className="h-1.5 bg-border rounded-full overflow-hidden">
                    <View
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.round(mealPct * 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {meals.length > 0 && (
          <View className="mx-5 mb-4 flex-row justify-between items-center bg-muted/40 rounded-xl px-4 py-2.5">
            <Text className="text-xs font-semibold text-foreground">Total</Text>
            <Text className="text-xs font-bold text-foreground">
              {fmt(total)}
              {unit}
            </Text>
          </View>
        )}

        <View className="border-t border-border py-3 items-center">
          <ModalClose>
            <Text className="text-sm font-semibold text-primary">Close</Text>
          </ModalClose>
        </View>
      </ModalContent>
    </Modal>
  );
}
