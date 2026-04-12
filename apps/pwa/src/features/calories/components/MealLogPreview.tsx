import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useInvalidateDashboard } from "@/hooks/dashboard";
import { createEntry } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import {
  Beef,
  ChevronDown,
  ChevronUp,
  Droplet,
  Flame,
  Leaf,
  Utensils,
  Wheat,
} from "lucide-react";
import { useState } from "react";
import type { LogMealInput } from "../schemas";
import { getToday } from "../utils";

interface MealLogPreviewProps extends LogMealInput {
  onLogged?: () => void;
  onCanceled?: () => void;
}

interface MacroItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  className?: string;
}

function MacroItem({ icon, label, value, unit, className }: MacroItemProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm">
        <span className="font-medium">{value}</span>
        <span className="text-muted-foreground"> {unit}</span>
        <span className="text-muted-foreground text-xs ml-1">{label}</span>
      </span>
    </div>
  );
}

export function MealLogPreview({
  meal,
  onLogged,
  onCanceled,
}: MealLogPreviewProps) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(true);
  const invalidateDashboard = useInvalidateDashboard();

  const mutation = useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      invalidateDashboard();
      // Notify parent that meal was logged (persists in message state)
      onLogged?.();
    },
  });

  const handleConfirm = () => {
    mutation.mutate({
      name: meal.name,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fat,
      fiber: meal.fiber ?? null,
      sugar: meal.sugar ?? null,
      sodium: meal.sodium ?? null,
      date: meal.date ?? getToday(),
      note: meal.note ?? null,
      foods: meal.items.map((item) => ({
        emoji: "🍽️",
        name: item.name,
        quantity: item.quantity > 1 ? `${item.quantity}x` : "1 serving",
        calories: item.calories,
      })),
    });
  };

  const handleCancel = () => {
    // Notify parent that meal was canceled (persists in message state)
    onCanceled?.();
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="size-5" />
          {meal.name}
        </CardTitle>
        {meal.description && (
          <CardDescription>{meal.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Items breakdown - collapsible */}
        {meal.items && meal.items.length > 0 && (
          <Collapsible open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full">
              {isBreakdownOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              <span className="font-medium">
                Calculation breakdown ({meal.items.length} items)
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="space-y-2 pl-2 border-l-2 border-muted">
                {meal.items.map((item, index) => (
                  <div
                    key={index}
                    className="text-sm bg-muted/50 rounded-md p-2"
                  >
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {item.quantity && item.quantity > 1 && (
                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-xs font-semibold rounded-full px-2 py-0.5">
                          ×{item.quantity}
                        </span>
                      )}
                      {item.name}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span>{item.calories} kcal</span>
                      <span>{item.protein}g protein</span>
                      <span>{item.carbs}g carbs</span>
                      <span>{item.fat}g fat</span>
                      {item.fiber !== undefined && (
                        <span>{item.fiber}g fiber</span>
                      )}
                      {item.sugar !== undefined && (
                        <span>{item.sugar}g sugar</span>
                      )}
                      {item.sodium !== undefined && (
                        <span>{item.sodium}mg sodium</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Totals section */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
            Totals
          </p>
          {/* Primary macros */}
          <div className="grid grid-cols-2 gap-2">
            <MacroItem
              icon={<Flame className="size-4" />}
              label="Calories"
              value={meal.calories}
              unit="kcal"
            />
            <MacroItem
              icon={<Beef className="size-4" />}
              label="Protein"
              value={meal.protein}
              unit="g"
            />
            <MacroItem
              icon={<Wheat className="size-4" />}
              label="Carbs"
              value={meal.carbs}
              unit="g"
            />
            <MacroItem
              icon={<Droplet className="size-4" />}
              label="Fat"
              value={meal.fat}
              unit="g"
            />
          </div>

          {/* Secondary macros - always show if present */}
          {(meal.fiber !== undefined ||
            meal.sugar !== undefined ||
            meal.sodium !== undefined) && (
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-dashed">
              {meal.fiber !== undefined && (
                <MacroItem
                  icon={<Leaf className="size-3" />}
                  label="Fiber"
                  value={meal.fiber}
                  unit="g"
                />
              )}
              {meal.sugar !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">🍬</span>
                  <span className="text-sm">
                    <span className="font-medium">{meal.sugar}</span>
                    <span className="text-muted-foreground"> g</span>
                    <span className="text-muted-foreground text-xs ml-1">
                      Sugar
                    </span>
                  </span>
                </div>
              )}
              {meal.sodium !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">🧂</span>
                  <span className="text-sm">
                    <span className="font-medium">{meal.sodium}</span>
                    <span className="text-muted-foreground"> mg</span>
                    <span className="text-muted-foreground text-xs ml-1">
                      Sodium
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note if present */}
        {meal.note && (
          <p className="text-xs text-muted-foreground italic border-t pt-2">
            {meal.note}
          </p>
        )}

        {/* Date if not today */}
        {meal.date && (
          <p className="text-xs text-muted-foreground">
            📅 Logging for: {meal.date}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "An error occurred"}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? "Logging..." : "Log Meal"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
