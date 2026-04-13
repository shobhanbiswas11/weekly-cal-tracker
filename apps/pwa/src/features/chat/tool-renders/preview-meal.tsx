import { createEntry } from "@/lib/api";
import type { FoodItem, LogMealInput } from "@weekly-cal/core";
import { Check, Loader2, Utensils, X } from "lucide-react";
import type { ReactNode } from "react";

// =============================================================================
// Types
// =============================================================================

type ToolStatus = {
  readonly type: "running" | "complete" | "incomplete" | "requires-action";
  readonly reason?: string;
};

interface RenderProps {
  args: Partial<LogMealInput>;
  result?: { success: boolean; message: string };
  status: ToolStatus;
  addResult: (result: { success: boolean; message: string }) => void;
}

interface GroupedFood {
  emoji: string;
  name: string;
  quantities: string[];
  count: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

function groupFoods(foods: FoodItem[]): GroupedFood[] {
  const grouped = new Map<string, GroupedFood>();

  for (const food of foods) {
    // Skip incomplete foods that are still streaming
    if (!food.name) continue;

    const key = food.name.toLowerCase();
    const existing = grouped.get(key);

    if (existing) {
      existing.count += 1;
      existing.quantities.push(food.quantity);
      existing.calories += food.calories;
      existing.protein += food.protein;
      existing.carbs += food.carbs;
      existing.fats += food.fats;
      existing.fiber += food.fiber ?? 0;
      existing.sugar += food.sugar ?? 0;
      existing.sodium += food.sodium ?? 0;
    } else {
      grouped.set(key, {
        emoji: food.emoji,
        name: food.name,
        quantities: [food.quantity],
        count: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        fiber: food.fiber ?? 0,
        sugar: food.sugar ?? 0,
        sodium: food.sodium ?? 0,
      });
    }
  }

  return Array.from(grouped.values());
}

function calculateTotals(foods: FoodItem[]) {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats,
      fiber: acc.fiber + (food.fiber ?? 0),
      sugar: acc.sugar + (food.sugar ?? 0),
      sodium: acc.sodium + (food.sodium ?? 0),
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

// Animation wrapper for progressive reveal
function AnimatedSection({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
      {children}
    </div>
  );
}

// =============================================================================
// Render Function
// =============================================================================

export function renderPreviewMeal({ args, result, addResult }: RenderProps) {
  // Show result state (complete or incomplete with result)
  if (result) {
    return (
      <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
        <div className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          {result.success ? (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <Check className="size-4" />
              </span>
              <span className="text-sm font-medium text-green-600">
                Meal logged successfully
              </span>
            </>
          ) : (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <X className="size-4" />
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {result.message}
              </span>
            </>
          )}
        </div>
      </article>
    );
  }

  const { name, foodItems, date, note } = args;
  const hasFood = !!(foodItems && foodItems.length > 0);
  const groupedFoods = hasFood ? groupFoods(foodItems) : [];
  const totals = hasFood ? calculateTotals(foodItems) : null;

  // Determine if we have enough data to show action buttons
  const canSubmit = hasFood && !!date;

  // Handle confirm - call API and add result
  const handleConfirm = async () => {
    if (!totals) return;
    try {
      await createEntry({
        name: name || "Meal",
        date: date!,
        note: note ?? null,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
        fiber: totals.fiber,
        sugar: totals.sugar,
        sodium: totals.sodium,
      });
      addResult({ success: true, message: "Meal logged successfully" });
    } catch (error) {
      addResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to log meal",
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    addResult({ success: false, message: "User cancelled" });
  };

  // Progressive/streaming view
  return (
    <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
      <div className="flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        {/* Header - always show with loading indicator when streaming */}
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {!canSubmit ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Utensils className="size-5" />
            )}
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            {name ? (
              <h2 className="text-base font-semibold leading-tight animate-in fade-in duration-200">
                {name}
              </h2>
            ) : (
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            )}
            {date ? (
              <span className="text-xs text-muted-foreground animate-in fade-in duration-200">
                {date}
              </span>
            ) : (
              <div className="mt-1 h-3 w-16 animate-pulse rounded bg-muted" />
            )}
          </div>
        </div>

        {/* Food Items - show as they stream in */}
        <AnimatedSection show={hasFood}>
          <div className="h-px bg-border" />
          <div className="mt-4 space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Items
            </span>
            <div className="space-y-2">
              {groupedFoods.map((food, index) => (
                <div
                  key={`${food.name}-${index}`}
                  className="animate-in fade-in slide-in-from-left-2 rounded-lg border bg-muted/30 p-3 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{food.emoji}</span>
                    <span className="flex-1 text-sm font-medium">
                      {food.name}
                    </span>
                    {food.count > 1 && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        ×{food.count}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {food.quantities.join(", ")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    <span>
                      <span className="font-medium">{food.calories}</span>{" "}
                      <span className="text-muted-foreground">kcal</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>
                      <span className="font-medium">{food.protein}g</span>{" "}
                      <span className="text-muted-foreground">P</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>
                      <span className="font-medium">{food.carbs}g</span>{" "}
                      <span className="text-muted-foreground">C</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span>
                      <span className="font-medium">{food.fats}g</span>{" "}
                      <span className="text-muted-foreground">F</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Total Macros - show when we have food */}
        <AnimatedSection show={!!totals}>
          <div className="h-px bg-border" />
          <div className="mt-4 space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Total
            </span>
            <div className="rounded-lg bg-primary/5 p-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary">
                    {totals?.calories ?? 0}
                  </span>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {totals?.protein ?? 0}g
                  </span>
                  <span className="text-xs text-muted-foreground">protein</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {totals?.carbs ?? 0}g
                  </span>
                  <span className="text-xs text-muted-foreground">carbs</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {totals?.fats ?? 0}g
                  </span>
                  <span className="text-xs text-muted-foreground">fat</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Note - show when available */}
        <AnimatedSection show={!!note}>
          <div className="h-px bg-border" />
          <div className="mt-4 space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Note
            </span>
            <p className="text-sm italic text-foreground/80">{note}</p>
          </div>
        </AnimatedSection>

        {/* Action Buttons - only show when ready to submit */}
        <AnimatedSection show={canSubmit}>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Log
            </button>
          </div>
        </AnimatedSection>
      </div>
    </article>
  );
}
