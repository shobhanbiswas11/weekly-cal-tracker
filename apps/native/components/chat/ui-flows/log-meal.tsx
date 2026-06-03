import { isCompleteOrCancelledUIFlow, uiFlowMeal } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { useState } from "react";
import { Text, View } from "react-native";
import { useInvalidateWeeklySummaryQuery } from "../../../hooks/use-weekly-summary-query";
import { FlowActionButtons, FlowResultCard } from "./common";
import type { UIFlowRendererProps } from "./types";

// =============================================================================
// Types
// =============================================================================

type FoodItem = {
  name: string;
  calories: number;
  quantity: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

// =============================================================================
// Helpers
// =============================================================================

function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

function calculateTotals(foods: FoodItem[]) {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats,
      fiber: acc.fiber + food.fiber,
      sugar: acc.sugar + food.sugar,
      sodium: acc.sodium + food.sodium,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  );
}

// =============================================================================
// Component
// =============================================================================

export function LogMeal({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { createEntry } = useApi();
  const invalidateSummary = useInvalidateWeeklySummaryQuery();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { name, date, note, foodItems } = uiFlowMeal.log.getInitPayload(flow);
  const hasFood = foodItems && foodItems.length > 0;
  const totals = hasFood ? calculateTotals(foodItems) : null;

  const handleConfirm = async () => {
    if (!totals) return;
    setLoading(true);
    try {
      await createEntry({
        name,
        date,
        note,
        calories: Math.round(totals.calories * 10) / 10,
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fats: Math.round(totals.fats * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
        sugar: Math.round(totals.sugar * 10) / 10,
        sodium: Math.round(totals.sodium * 10) / 10,
        foodItems: foodItems.map((item: FoodItem) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      });
      invalidateSummary();
      addResult(uiFlowMeal.log.complete("Meal logged successfully"));
    } catch (error) {
      addResult(
        uiFlowMeal.log.cancel(
          error instanceof Error ? error.message : "Failed to log meal",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowMeal.log.cancel("Meal log cancelled by user"));
  };

  return (
    <View className="w-full max-w-md flex-col gap-3">
      <View className="w-full flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        {/* Header */}
        <View className="flex-row items-start gap-3">
          <View className="size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Text className="text-lg">🍽️</Text>
          </View>
          <View className="flex-1 flex-col gap-0.5">
            <Text className="text-base font-semibold leading-tight text-foreground">
              {name}
            </Text>
            <Text className="text-xs text-muted-foreground">{date}</Text>
          </View>
        </View>

        {/* Food Items */}
        {hasFood && (
          <>
            <View style={{ height: 1 }} className="bg-border" />
            <View className="gap-2">
              <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Items
              </Text>
              <View className="gap-2">
                {foodItems.map((food: FoodItem, index: number) => (
                  <View
                    key={`${food.name}-${index}`}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <Text className="text-sm font-medium text-foreground">
                      {food.name}
                    </Text>
                    <Text className="mt-0.5 text-xs text-muted-foreground">
                      {food.quantity}
                    </Text>
                    <View className="mt-2 flex-row flex-wrap gap-x-3 gap-y-1">
                      <Text className="text-xs text-foreground">
                        <Text className="font-medium">
                          {formatNumber(food.calories)}
                        </Text>
                        <Text className="text-muted-foreground"> kcal</Text>
                      </Text>
                      <Text className="text-xs text-muted-foreground">•</Text>
                      <Text className="text-xs text-foreground">
                        <Text className="font-medium">
                          {formatNumber(food.protein)}g
                        </Text>
                        <Text className="text-muted-foreground"> P</Text>
                      </Text>
                      <Text className="text-xs text-muted-foreground">•</Text>
                      <Text className="text-xs text-foreground">
                        <Text className="font-medium">
                          {formatNumber(food.carbs)}g
                        </Text>
                        <Text className="text-muted-foreground"> C</Text>
                      </Text>
                      <Text className="text-xs text-muted-foreground">•</Text>
                      <Text className="text-xs text-foreground">
                        <Text className="font-medium">
                          {formatNumber(food.fats)}g
                        </Text>
                        <Text className="text-muted-foreground"> F</Text>
                      </Text>
                    </View>
                    <View className="mt-1 flex-row flex-wrap gap-x-3 gap-y-1">
                      <Text className="text-xs text-muted-foreground">
                        <Text className="font-medium text-foreground">
                          {formatNumber(food.fiber)}g
                        </Text>{" "}
                        fiber
                      </Text>
                      <Text className="text-xs text-muted-foreground">•</Text>
                      <Text className="text-xs text-muted-foreground">
                        <Text className="font-medium text-foreground">
                          {formatNumber(food.sugar)}g
                        </Text>{" "}
                        sugar
                      </Text>
                      <Text className="text-xs text-muted-foreground">•</Text>
                      <Text className="text-xs text-muted-foreground">
                        <Text className="font-medium text-foreground">
                          {formatNumber(food.sodium)}mg
                        </Text>{" "}
                        sodium
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Total Macros */}
        {totals && (
          <>
            <View style={{ height: 1 }} className="bg-border" />
            <View className="gap-2">
              <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total
              </Text>
              <View className="rounded-lg bg-primary/5 p-3">
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-lg font-bold text-primary">
                      {formatNumber(totals.calories)}
                    </Text>
                    <Text className="text-xs text-muted-foreground">kcal</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-foreground">
                      {formatNumber(totals.protein)}g
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      protein
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-foreground">
                      {formatNumber(totals.carbs)}g
                    </Text>
                    <Text className="text-xs text-muted-foreground">carbs</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-lg font-semibold text-foreground">
                      {formatNumber(totals.fats)}g
                    </Text>
                    <Text className="text-xs text-muted-foreground">fat</Text>
                  </View>
                </View>
                <View className="mt-2 flex-row justify-center gap-4">
                  <Text className="text-xs text-muted-foreground">
                    <Text className="font-medium text-foreground">
                      {formatNumber(totals.fiber)}g
                    </Text>{" "}
                    fiber
                  </Text>
                  <Text className="text-xs text-muted-foreground">•</Text>
                  <Text className="text-xs text-muted-foreground">
                    <Text className="font-medium text-foreground">
                      {formatNumber(totals.sugar)}g
                    </Text>{" "}
                    sugar
                  </Text>
                  <Text className="text-xs text-muted-foreground">•</Text>
                  <Text className="text-xs text-muted-foreground">
                    <Text className="font-medium text-foreground">
                      {formatNumber(totals.sodium)}mg
                    </Text>{" "}
                    sodium
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Note */}
        {note ? (
          <>
            <View style={{ height: 1 }} className="bg-border" />
            <View className="gap-1.5">
              <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Note
              </Text>
              <Text className="text-sm italic text-foreground/80">{note}</Text>
            </View>
          </>
        ) : null}

        <FlowActionButtons
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          cancelLabel="Cancel"
          confirmLabel="Log"
          loading={loading}
        />
      </View>
    </View>
  );
}
