import { Text, View } from "react-native";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

export function NutrientRow({
  label,
  consumed,
  target,
  unit,
  color,
}: {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const over = consumed > target;

  return (
    <View className="gap-1.5">
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        <Text
          className={`text-xs ${over ? "text-red-500" : "text-muted-foreground"}`}
        >
          {fmt(consumed)}
          {unit} / {fmt(target)}
          {unit}
        </Text>
      </View>
      {/* Progress track */}
      <View className="h-1.25 bg-border rounded-full overflow-hidden">
        <View
          className="h-1.25 rounded-full"
          style={{
            width: `${Math.round(pct * 100)}%`,
            backgroundColor: over ? "#ef4444" : color,
          }}
        />
      </View>
    </View>
  );
}
