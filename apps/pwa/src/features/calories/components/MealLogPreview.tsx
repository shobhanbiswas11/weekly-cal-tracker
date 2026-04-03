import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInvalidateDashboard } from "@/hooks/dashboard";
import { createEntry } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Beef, Droplet, Flame, Leaf, Utensils, Wheat } from "lucide-react";
import { useState } from "react";
import type { LogMealInput } from "../schemas";

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

export function MealLogPreview({ meal }: LogMealInput) {
  const [isCanceled, setIsCanceled] = useState(false);
  const invalidateDashboard = useInvalidateDashboard();

  const mutation = useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      invalidateDashboard();
    },
  });

  const handleConfirm = () => {
    mutation.mutate({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fat,
      date: meal.date,
    });
  };

  const handleCancel = () => {
    setIsCanceled(true);
  };

  if (mutation.isSuccess) {
    return (
      <Card size="sm">
        <CardContent className="flex items-center gap-2 text-muted-foreground">
          <Utensils className="size-4" />
          <span>
            Logged {meal.name} — {meal.calories} kcal
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isCanceled) {
    return (
      <Card size="sm">
        <CardContent className="text-muted-foreground">
          Meal entry canceled.
        </CardContent>
      </Card>
    );
  }

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

        {/* Optional macros */}
        {(meal.fiber !== undefined ||
          meal.sugar !== undefined ||
          meal.sodium !== undefined) && (
          <div className="border-t pt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
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
          </div>
        )}

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
