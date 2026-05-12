import { isCompleteOrCancelledUIFlow, uiFlowMeal } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { useState } from "react";
import { Text, View } from "react-native";
import { useInvalidateSummaryQuery } from "../../../hooks/use-summary-query";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";
import type { UIFlowRendererProps } from "./types";

const fieldLabels: Record<string, string> = {
  name: "Name",
  date: "Date",
  calories: "Calories",
  protein: "Protein",
  carbs: "Carbs",
  fats: "Fats",
  fiber: "Fiber",
  sugar: "Sugar",
  sodium: "Sodium",
  note: "Note",
  foodItems: "Food Items",
};

function parseValue(field: string, value: string): unknown {
  if (field === "foodItems") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function formatValue(field: string, value: string): string {
  if (value === null || value === undefined) return "—";
  if (field === "calories") return `${value} kcal`;
  if (field === "sodium") return `${value}mg`;
  if (["protein", "carbs", "fats", "fiber", "sugar"].includes(field))
    return `${value}g`;
  return String(value);
}

function parseFoodItems(
  value: string,
): Array<{ name: string; quantity: string }> | null {
  try {
    return JSON.parse(value) as Array<{ name: string; quantity: string }>;
  } catch {
    return null;
  }
}

function changesToObject(
  changes: Array<{ field: string; value: string }>,
): Record<string, unknown> {
  return changes.reduce(
    (acc, { field, value }) => {
      acc[field] = parseValue(field, value);
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

export function UpdateMeal({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { updateEntry } = useApi();
  const invalidateSummary = useInvalidateSummaryQuery();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { mealId, date, mealName, changes } =
    uiFlowMeal.update.getInitPayload(flow);

  const hasChanges = changes.length > 0;
  const foodItemsChange = changes.find(
    (c: { field: string }) => c.field === "foodItems",
  );
  const otherChanges = changes.filter(
    (c: { field: string }) => c.field !== "foodItems",
  );
  const foodItems = foodItemsChange
    ? parseFoodItems(foodItemsChange.value)
    : null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateEntry(date, mealId, changesToObject(changes));
      invalidateSummary();
      addResult(uiFlowMeal.update.complete("Meal updated successfully"));
    } catch (error) {
      addResult(
        uiFlowMeal.update.cancel(
          error instanceof Error ? error.message : "Failed to update meal",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowMeal.update.cancel("Update cancelled by user"));
  };

  return (
    <FlowCard
      iconName="edit-2"
      iconColorVar="--color-foreground"
      iconBgClass="bg-amber-500/10"
      title="Update Meal"
      subtitle={`${mealName} · ${date}`}
    >
      {hasChanges && (
        <FlowSection label="Proposed Changes">
          <View className="gap-2 rounded-lg bg-muted/30 p-3">
            {/* Regular field changes */}
            {otherChanges.length > 0 && (
              <View className="gap-1">
                {otherChanges.map(
                  ({ field, value }: { field: string; value: string }) => (
                    <View
                      key={field}
                      className="flex-row items-center justify-between py-1.5"
                    >
                      <Text className="text-sm text-muted-foreground">
                        {fieldLabels[field] || field}
                      </Text>
                      <Text className="text-right text-sm font-medium text-foreground">
                        {formatValue(field, value)}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            )}

            {/* Food items */}
            {foodItems && foodItems.length > 0 && (
              <>
                {otherChanges.length > 0 && (
                  <View style={{ height: 1 }} className="bg-border/50" />
                )}
                <View className="gap-1.5">
                  <Text className="text-xs font-medium text-muted-foreground">
                    {fieldLabels.foodItems}
                  </Text>
                  <View className="gap-1">
                    {foodItems.map(
                      (
                        item: { name: string; quantity: string },
                        index: number,
                      ) => (
                        <View
                          key={`${item.name}-${index}`}
                          className="flex-row items-center justify-between"
                        >
                          <Text className="text-sm font-medium text-foreground">
                            {item.name}
                          </Text>
                          <Text className="text-sm text-muted-foreground">
                            {item.quantity}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              </>
            )}
          </View>
        </FlowSection>
      )}

      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Discard"
        confirmLabel="Update"
        loading={loading}
      />
    </FlowCard>
  );
}
