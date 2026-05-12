import { ActivityIndicator, Text, View } from "react-native";
import { ToolUIWrapper } from "./tool-wrapper";

export function LoadingState({ title }: { title: string }) {
  return (
    <ToolUIWrapper>
      <View className="flex-row items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
        <ActivityIndicator size="small" className="text-primary" />
        <Text className="text-sm text-foreground">{title}...</Text>
      </View>
    </ToolUIWrapper>
  );
}
