// Calorie KPI card with progress ring

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface CalorieKPIProps {
  consumed: number;
  goal: number;
  label: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CalorieKPI({
  consumed,
  goal,
  label,
  sublabel,
  size = "md",
  className,
}: CalorieKPIProps) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min((consumed / goal) * 100, 100);

  // Determine status color
  const getStatusColor = () => {
    if (percentage >= 100) return "text-red-500";
    if (percentage >= 80) return "text-amber-500";
    return "text-green-500";
  };

  return (
    <Card className={cn("flex-1", className)}>
      <CardContent className="flex flex-col items-center gap-2 pt-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </span>

        <ProgressRing
          value={consumed}
          max={goal}
          size={size}
          color={
            percentage >= 100
              ? "danger"
              : percentage >= 80
                ? "warning"
                : "default"
          }
        >
          <div className="flex flex-col items-center">
            <Flame className={cn("size-4", getStatusColor())} />
            <span
              className={cn(
                "font-bold tabular-nums",
                size === "sm" && "text-base",
                size === "md" && "text-xl",
                size === "lg" && "text-2xl",
              )}
            >
              {consumed.toLocaleString()}
            </span>
          </div>
        </ProgressRing>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            of {goal.toLocaleString()} kcal
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
          )}
          <p className={cn("text-sm font-medium mt-1", getStatusColor())}>
            {remaining > 0
              ? `${remaining.toLocaleString()} left`
              : "Goal reached!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
