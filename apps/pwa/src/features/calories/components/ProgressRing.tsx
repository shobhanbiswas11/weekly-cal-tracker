// Circular progress ring component

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  value: number;
  max: number;
  size?: "sm" | "md" | "lg";
  strokeWidth?: number;
  className?: string;
  showValue?: boolean;
  label?: string;
  color?: "default" | "success" | "warning" | "danger";
  children?: React.ReactNode;
}

const sizeMap = {
  sm: 64,
  md: 96,
  lg: 128,
};

const colorMap = {
  default: "stroke-primary",
  success: "stroke-green-500",
  warning: "stroke-amber-500",
  danger: "stroke-red-500",
};

export function ProgressRing({
  value,
  max,
  size = "md",
  strokeWidth = 8,
  className,
  showValue = true,
  label,
  color = "default",
  children,
}: ProgressRingProps) {
  const dimensions = sizeMap[size];
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Auto color based on percentage if not specified
  const autoColor =
    percentage >= 100 ? "danger" : percentage >= 80 ? "warning" : "default";
  const finalColor = color === "default" ? autoColor : color;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg
        width={dimensions}
        height={dimensions}
        viewBox={`0 0 ${dimensions} ${dimensions}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "transition-all duration-500 ease-out",
            colorMap[finalColor],
          )}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : showValue ? (
          <>
            <span
              className={cn(
                "font-semibold tabular-nums",
                size === "sm" && "text-sm",
                size === "md" && "text-lg",
                size === "lg" && "text-2xl",
              )}
            >
              {value.toLocaleString()}
            </span>
            {label && (
              <span className="text-xs text-muted-foreground">{label}</span>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
