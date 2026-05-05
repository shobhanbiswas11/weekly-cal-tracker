import { useInvalidateSummaryQuery } from "@/hooks/use-summary-query";
import { updateEntry } from "@/lib/api";
import { isCompleteOrCancelledUIFlow, uiFlowMeal } from "@weekly-cal/core";
import { Pencil } from "lucide-react";
import { useState } from "react";
import type { UIFlowRendererProps } from "../types";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";

// Human-readable labels for meal fields
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
  // foodItems comes as a JSON string
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

  if (field === "calories") {
    return `${value} kcal`;
  }
  if (field === "sodium") {
    return `${value}mg`;
  }
  if (["protein", "carbs", "fats", "fiber", "sugar"].includes(field)) {
    return `${value}g`;
  }
  return String(value);
}

/** Parse food items from JSON string */
function parseFoodItems(
  value: string,
): Array<{ name: string; quantity: string }> | null {
  try {
    return JSON.parse(value) as Array<{ name: string; quantity: string }>;
  } catch {
    return null;
  }
}

/** Convert changes array to object for API call */
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

export const UpdateMeal = ({ addResult, flow }: UIFlowRendererProps) => {
  const [loading, setLoading] = useState(false);
  const invalidateSummary = useInvalidateSummaryQuery();

  // Show result state for completed or cancelled
  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { mealId, date, mealName, changes } =
    uiFlowMeal.update.getInitPayload(flow);

  const hasChanges = changes.length > 0;

  // Separate food items from other changes
  const foodItemsChange = changes.find((c) => c.field === "foodItems");
  const otherChanges = changes.filter((c) => c.field !== "foodItems");
  const foodItems = foodItemsChange
    ? parseFoodItems(foodItemsChange.value)
    : null;

  // Handle confirm - call API and add result
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateEntry(date, mealId, changesToObject(changes));
      invalidateSummary();
      addResult(uiFlowMeal.update.complete("Meal updated successfully"));
    } catch (error) {
      console.log(error);
      addResult(
        uiFlowMeal.update.cancel(
          error instanceof Error ? error.message : "Failed to update meal",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    addResult(uiFlowMeal.update.cancel("Update cancelled by user"));
  };

  return (
    <FlowCard
      icon={Pencil}
      iconColorClass="bg-amber-500/10 text-amber-600"
      title="Update Meal"
      subtitle={`${mealName} · ${date}`}
    >
      {/* Changes List */}
      {hasChanges && (
        <FlowSection label="Proposed Changes">
          <div className="space-y-2 rounded-lg bg-muted/30 p-3">
            {/* Regular field changes */}
            {otherChanges.length > 0 && (
              <div className="space-y-1">
                {otherChanges.map(
                  ({ field, value }: { field: string; value: string }) => (
                    <div
                      key={field}
                      className="flex items-center justify-between py-1.5 text-sm"
                    >
                      <span className="text-muted-foreground">
                        {fieldLabels[field] || field}
                      </span>
                      <span className="text-right font-medium">
                        {formatValue(field, value)}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Food items list */}
            {foodItems && foodItems.length > 0 && (
              <>
                {otherChanges.length > 0 && (
                  <div className="h-px bg-border/50" />
                )}
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {fieldLabels.foodItems}
                  </span>
                  <ul className="space-y-1">
                    {foodItems.map((item, index) => (
                      <li
                        key={`${item.name}-${index}`}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </FlowSection>
      )}

      {/* Action Buttons */}
      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Discard"
        confirmLabel="Update"
        loading={loading}
      />
    </FlowCard>
  );
};
