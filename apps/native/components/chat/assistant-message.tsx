import {
  ActionBarPrimitive,
  AuiIf,
  MessagePrimitive,
} from "@assistant-ui/react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { ActivityIndicator, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { ToolFallback } from "./tool-fallback";

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root>
      <View className="px-4 py-1.5 my-0.5 max-w-[92%]">
        <MessagePrimitive.Content
          renderText={({ part }) => (
            <Text className="text-foreground text-base leading-6">
              {part.text}
            </Text>
          )}
          renderToolCall={({ part }) => (
            <ToolFallback
              toolName={part.toolName}
              argsText={part.argsText}
              result={(part as any).result}
              status={(part as any).status}
            />
          )}
        />
        <AuiIf condition={(s) => s.thread.isRunning && s.message.isLast}>
          <ActivityIndicator size="small" className="mt-2 self-start" />
        </AuiIf>
        <AuiIf condition={(s) => !s.thread.isRunning || !s.message.isLast}>
          <AssistantActionBar />
        </AuiIf>
      </View>
    </MessagePrimitive.Root>
  );
}

function AssistantActionBar() {
  const iconColor = useCSSVariable("--color-muted-foreground") as string;

  return (
    <View className="flex-row gap-1 mt-1.5 relative self-start">
      <ActionBarPrimitive.Copy
        copiedDuration={2000}
        copyToClipboard={(text) => {
          Clipboard.setStringAsync(text);
        }}
      >
        {({ isCopied }: { isCopied: boolean }) => (
          <View className="w-7 h-7 rounded-full ">
            <Feather
              name={isCopied ? "check" : "copy"}
              size={14}
              color={iconColor}
            />
          </View>
        )}
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.Reload>
        <View className="w-7 h-7 rounded-full ">
          <Feather name="refresh-cw" size={14} color={iconColor} />
        </View>
      </ActionBarPrimitive.Reload>
    </View>
  );
}
