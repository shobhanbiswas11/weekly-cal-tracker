// Grid of macros with optional progress

import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MacroTotals, UserGoals } from "../types";
import { DEFAULT_GOALS } from "../types";
import { MacroDisplay } from "./MacroDisplay";

interface MacroGridProps {
  totals: MacroTotals;
  goals?: Partial<UserGoals>;
  showProgress?: boolean;
  showExtended?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const progressColors = {
  protein: "bg-rose-500",
  carbs: "bg-amber-500",
  fat: "bg-blue-500",
};

export function MacroGrid({
  totals,
  goals = DEFAULT_GOALS,
  showProgress = false,
  showExtended = false,
  size = "md",
  className,
}: MacroGridProps) {
  const mainMacros = [
    {
      type: "protein" as const,
      value: totals.protein,
      goal: goals.proteinGoal,
    },
    { type: "carbs" as const, value: totals.carbs, goal: goals.carbsGoal },
    { type: "fat" as const, value: totals.fat, goal: goals.fatGoal },
  ];

  const extendedMacros = [
    { type: "fiber" as const, value: totals.fiber },
    { type: "sugar" as const, value: totals.sugar },
  ].filter((m) => m.value !== undefined && m.value > 0);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main macros */}
      <div className="flex justify-around">
        {mainMacros.map((macro) => (
          <div key={macro.type} className="flex flex-col items-center gap-2">
            <MacroDisplay
              type={macro.type}
              value={macro.value}
              goal={showProgress ? macro.goal : undefined}
              size={size}
              showLabel
            />
            {showProgress && macro.goal && (
              <Progress value={macro.value} max={macro.goal} className="w-16">
                <ProgressTrack className="h-1.5">
                  <ProgressIndicator className={progressColors[macro.type]} />
                </ProgressTrack>
              </Progress>
            )}
          </div>
        ))}
      </div>

      {/* Extended macros */}
      {showExtended && extendedMacros.length > 0 && (
        <div className="flex justify-center gap-6 pt-2 border-t border-border/50">
          {extendedMacros.map((macro) => (
            <MacroDisplay
              key={macro.type}
              type={macro.type}
              value={macro.value!}
              size="sm"
              showLabel
            />
          ))}
        </div>
      )}
    </div>
  );
}
