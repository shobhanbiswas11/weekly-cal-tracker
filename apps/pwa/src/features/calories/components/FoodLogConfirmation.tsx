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
import type { LogFoodInput } from "../schemas";

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

export function FoodLogConfirmation({ food }: LogFoodInput) {
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
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fat,
      date: food.date,
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
            Logged {food.name} — {food.calories} kcal
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isCanceled) {
    return (
      <Card size="sm">
        <CardContent className="text-muted-foreground">
          Food entry canceled.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="size-5" />
          {food.name}
        </CardTitle>
        <CardDescription>
          Review the nutrition details before logging.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Primary macros */}
        <div className="grid grid-cols-2 gap-2">
          <MacroItem
            icon={<Flame className="size-4" />}
            label="Calories"
            value={food.calories}
            unit="kcal"
          />
          <MacroItem
            icon={<Beef className="size-4" />}
            label="Protein"
            value={food.protein}
            unit="g"
          />
          <MacroItem
            icon={<Wheat className="size-4" />}
            label="Carbs"
            value={food.carbs}
            unit="g"
          />
          <MacroItem
            icon={<Droplet className="size-4" />}
            label="Fat"
            value={food.fat}
            unit="g"
          />
        </div>

        {/* Optional macros */}
        {(food.fiber !== undefined ||
          food.sugar !== undefined ||
          food.sodium !== undefined) && (
          <div className="border-t pt-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {food.fiber !== undefined && (
                <MacroItem
                  icon={<Leaf className="size-3" />}
                  label="Fiber"
                  value={food.fiber}
                  unit="g"
                />
              )}
              {food.sugar !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">🍬</span>
                  <span className="text-sm">
                    <span className="font-medium">{food.sugar}</span>
                    <span className="text-muted-foreground"> g</span>
                    <span className="text-muted-foreground text-xs ml-1">
                      Sugar
                    </span>
                  </span>
                </div>
              )}
              {food.sodium !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">🧂</span>
                  <span className="text-sm">
                    <span className="font-medium">{food.sodium}</span>
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
        {food.note && (
          <p className="text-xs text-muted-foreground italic border-t pt-2">
            {food.note}
          </p>
        )}

        {/* Date if not today */}
        {food.date && (
          <p className="text-xs text-muted-foreground">
            📅 Logging for: {food.date}
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
            {mutation.isPending ? "Logging..." : "Log Food"}
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
