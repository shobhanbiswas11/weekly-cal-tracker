import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type Props = {
  toolName: string;
  argsText?: string;
  result?: unknown;
  status?: { type: string };
};

export function ToolFallback({ toolName, argsText, result, status }: Props) {
  const [open, setOpen] = useState(false);
  const isRunning = status?.type === "running";

  return (
    <View className="my-1 rounded-lg border border-border overflow-hidden">
      <Pressable
        onPress={() => setOpen((v) => !v)}
        className="flex-row items-center justify-between px-3 py-2 bg-muted/30"
      >
        <View className="flex-row items-center gap-2">
          {isRunning ? <ActivityIndicator size="small" /> : null}
          <Text className="text-sm font-medium text-muted-foreground">
            {toolName}
          </Text>
        </View>
        <Text className="text-muted-foreground text-xs">
          {open ? "▲" : "▼"}
        </Text>
      </Pressable>
      {open ? (
        <View className="px-3 py-2">
          {argsText ? (
            <Text className="text-xs text-muted-foreground font-mono">
              {argsText}
            </Text>
          ) : null}
          {result !== undefined ? (
            <Text className="text-xs text-foreground font-mono mt-1">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
