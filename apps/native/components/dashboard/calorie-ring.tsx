import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

// Primary color from theme (oklch(0.638 0.138 167) ≈ teal-green)
const COLOR_PRIMARY = "#2db07a";
const COLOR_AMBER = "#f59e0b";
const COLOR_RED = "#ef4444";
const COLOR_TRACK = "#e5e7eb"; // gray-200

export function CalorieRing({
  consumed,
  budget,
  size = 160,
  strokeWidth = 14,
}: {
  consumed: number;
  budget: number;
  size?: number;
  strokeWidth?: number;
}) {
  const pct = budget > 0 ? clamp(consumed / budget, 0, 1) : 0;
  const over = consumed > budget;
  const remaining = Math.max(0, budget - consumed);

  const accentColor = over
    ? COLOR_RED
    : pct > 0.85
      ? COLOR_AMBER
      : COLOR_PRIMARY;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);
  const center = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Track (background circle) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLOR_TRACK}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc — starts at 12 o'clock (rotate -90°) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={accentColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>

      <Text className="text-3xl font-bold text-foreground">
        {fmt(over ? consumed - budget : remaining)}
      </Text>
      <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
        {over ? "kcal over" : "kcal left"}
      </Text>
    </View>
  );
}
