import { useInvalidateSummaryQuery } from "@/hooks/use-summary-query";
import { createEntry } from "@/lib/api";
import { isCompleteOrCancelledUIFlow, uiFlowMeal } from "@weekly-cal/core";
import { Utensils } from "lucide-react";
import { useState } from "react";
import type { UIFlowRendererProps } from "../types";
import { FlowActionButtons, FlowResultCard } from "./common";

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
// Helper Functions
// =============================================================================

/** Round to 1 decimal place or whole number if no decimal needed */
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
  const invalidateSummary = useInvalidateSummaryQuery();

  // Show result state for completed or cancelled
  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  // State is "initiated" - show confirmation UI
  const { name, date, note, foodItems } = uiFlowMeal.log.getInitPayload(flow);
  const hasFood = foodItems && foodItems.length > 0;
  const totals = hasFood ? calculateTotals(foodItems) : null;

  // Handle confirm - call API and add result
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
      console.log(error);
      addResult(
        uiFlowMeal.log.cancel(
          error instanceof Error ? error.message : "Failed to log meal",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    addResult(uiFlowMeal.log.cancel("Meal log cancelled by user"));
  };

  return (
    <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
      <div className="flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Utensils className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-base font-semibold leading-tight">{name}</h2>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
        </div>

        {/* Food Items */}
        {hasFood && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Items
              </span>
              <div className="space-y-2">
                {foodItems.map((food: FoodItem, index: number) => (
                  <div
                    key={`${food.name}-${index}`}
                    className="rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-sm font-medium">
                        {food.name}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {food.quantity}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      <span>
                        <span className="font-medium">
                          {formatNumber(food.calories)}
                        </span>{" "}
                        <span className="text-muted-foreground">kcal</span>
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        <span className="font-medium">
                          {formatNumber(food.protein)}g
                        </span>{" "}
                        <span className="text-muted-foreground">P</span>
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        <span className="font-medium">
                          {formatNumber(food.carbs)}g
                        </span>{" "}
                        <span className="text-muted-foreground">C</span>
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span>
                        <span className="font-medium">
                          {formatNumber(food.fats)}g
                        </span>{" "}
                        <span className="text-muted-foreground">F</span>
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium text-foreground">
                          {formatNumber(food.fiber)}g
                        </span>{" "}
                        fiber
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium text-foreground">
                          {formatNumber(food.sugar)}g
                        </span>{" "}
                        sugar
                      </span>
                      <span>•</span>
                      <span>
                        <span className="font-medium text-foreground">
                          {formatNumber(food.sodium)}mg
                        </span>{" "}
                        sodium
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Total Macros */}
        {totals && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total
              </span>
              <div className="rounded-lg bg-primary/5 p-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-primary">
                      {formatNumber(totals.calories)}
                    </span>
                    <span className="text-xs text-muted-foreground">kcal</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">
                      {formatNumber(totals.protein)}g
                    </span>
                    <span className="text-xs text-muted-foreground">
                      protein
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">
                      {formatNumber(totals.carbs)}g
                    </span>
                    <span className="text-xs text-muted-foreground">carbs</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">
                      {formatNumber(totals.fats)}g
                    </span>
                    <span className="text-xs text-muted-foreground">fat</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
                  <span>
                    <span className="font-medium text-foreground">
                      {formatNumber(totals.fiber)}g
                    </span>{" "}
                    fiber
                  </span>
                  <span>•</span>
                  <span>
                    <span className="font-medium text-foreground">
                      {formatNumber(totals.sugar)}g
                    </span>{" "}
                    sugar
                  </span>
                  <span>•</span>
                  <span>
                    <span className="font-medium text-foreground">
                      {formatNumber(totals.sodium)}mg
                    </span>{" "}
                    sodium
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Note */}
        {note && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Note
              </span>
              <p className="text-sm italic text-foreground/80">{note}</p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <FlowActionButtons
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          cancelLabel="Cancel"
          confirmLabel="Log"
          loading={loading}
        />
      </div>
    </article>
  );
}
