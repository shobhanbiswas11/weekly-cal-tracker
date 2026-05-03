import { clamp, fmt } from "@/lib/utils";

export function CalorieRing({
  consumed,
  budget,
  size = 148,
  strokeWidth = 11,
}: {
  consumed: number;
  budget: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = budget > 0 ? clamp(consumed / budget, 0, 1) : 0;
  const over = consumed > budget;
  const remaining = Math.max(0, budget - consumed);

  const ringColor = over ? "#ef4444" : pct > 0.85 ? "#f59e0b" : "#10b981";

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          stroke={ringColor}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center leading-tight">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{ color: ringColor }}
        >
          {fmt(over ? consumed - budget : remaining)}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {over ? "kcal over" : "kcal left"}
        </span>
      </div>
    </div>
  );
}
