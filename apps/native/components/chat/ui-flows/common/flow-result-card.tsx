import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

type FlowResultState = "completed" | "cancelled";

function ResultIcon({ state }: { state: FlowResultState }) {
  const primaryColor = useCSSVariable("--color-primary") as string;
  const mutedColor = useCSSVariable("--color-muted-foreground") as string;

  if (state === "completed") {
    return <Feather name="check-circle" size={16} color={primaryColor} />;
  }
  return <Feather name="x" size={16} color={mutedColor} />;
}

export function FlowResultCard({
  state,
  message,
}: {
  state: FlowResultState;
  message?: string;
}) {
  const isSuccess = state === "completed";

  return (
    <View className="w-full max-w-md">
      <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <View
          className={`size-8 items-center justify-center rounded-full ${
            isSuccess ? "bg-primary/10" : "bg-muted"
          }`}
        >
          <ResultIcon state={state} />
        </View>
        <Text
          className={`text-sm font-medium ${
            isSuccess ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {message ?? (isSuccess ? "Completed successfully" : "Cancelled")}
        </Text>
      </View>
    </View>
  );
}
