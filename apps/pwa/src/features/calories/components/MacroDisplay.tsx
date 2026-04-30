// Macro display with icon

import { cn } from "@/lib/utils";
import type { MacroType } from "@weekly-cal/core";
import { Candy, Droplet, Droplets, Dumbbell, Leaf, Wheat } from "lucide-react";

interface MacroDisplayProps {
  type: Exclude<MacroType, "calories">;
  value: number;
  goal?: number;
  unit?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const macroConfig = {
  protein: {
    icon: Dumbbell,
    label: "Protein",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    unit: "g",
  },
  carbs: {
    icon: Wheat,
    label: "Carbs",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    unit: "g",
  },
  fat: {
    icon: Droplet,
    label: "Fat",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    unit: "g",
  },
  fiber: {
    icon: Leaf,
    label: "Fiber",
    color: "text-success",
    bgColor: "bg-success/10",
    unit: "g",
  },
  sugar: {
    icon: Candy,
    label: "Sugar",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    unit: "g",
  },
  sodium: {
    icon: Droplets,
    label: "Sodium",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
    unit: "mg",
  },
};

const sizeStyles = {
  sm: {
    container: "gap-1",
    icon: "size-4",
    iconWrapper: "size-6 rounded-md",
    value: "text-sm",
    label: "text-xs",
  },
  md: {
    container: "gap-1.5",
    icon: "size-5",
    iconWrapper: "size-8 rounded-lg",
    value: "text-base",
    label: "text-xs",
  },
  lg: {
    container: "gap-2",
    icon: "size-6",
    iconWrapper: "size-10 rounded-lg",
    value: "text-lg",
    label: "text-sm",
  },
};

export function MacroDisplay({
  type,
  value,
  goal,
  unit,
  size = "md",
  showLabel = false,
  className,
}: MacroDisplayProps) {
  const config = macroConfig[type];
  const Icon = config.icon;
  const styles = sizeStyles[size];
  const displayUnit = unit || config.unit;

  return (
    <div
      className={cn("flex flex-col items-center", styles.container, className)}
    >
      <div
        className={cn(
          "flex items-center justify-center",
          config.bgColor,
          styles.iconWrapper,
        )}
      >
        <Icon className={cn(config.color, styles.icon)} />
      </div>
      <div className="flex flex-col items-center">
        <span className={cn("font-medium tabular-nums", styles.value)}>
          {Math.round(value)}
          {displayUnit}
          {goal && (
            <span className="text-muted-foreground font-normal">/{goal}</span>
          )}
        </span>
        {showLabel && (
          <span className={cn("text-muted-foreground", styles.label)}>
            {config.label}
          </span>
        )}
      </div>
    </div>
  );
}
