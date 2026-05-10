import { Text, View } from "react-native";

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

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

  const ringClass = over
    ? "border-red-500"
    : pct > 0.85
      ? "border-amber-500"
      : "border-primary";
  const textClass = over
    ? "text-red-500"
    : pct > 0.85
      ? "text-amber-500"
      : "text-primary";

  return (
    <View
      className={`items-center justify-center bg-transparent ${ringClass}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
      }}
    >
      <Text className={`text-3xl font-bold ${textClass}`}>
        {fmt(over ? consumed - budget : remaining)}
      </Text>
      <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mt-0.5">
        {over ? "kcal over" : "kcal left"}
      </Text>
    </View>
  );
}
