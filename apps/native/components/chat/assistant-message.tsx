import {
  ActionBarPrimitive,
  AuiIf,
  MessagePrimitive,
} from "@assistant-ui/react-native";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { AssistantAvatar } from "./assistant-avatar";
import { ToolFallback } from "./tool-fallback";

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root>
      <View className="flex-row items-start px-4 py-1.5 my-0.5 max-w-[92%]">
        <AssistantAvatar />
        <View className="flex-1">
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
          <AuiIf condition={(s) => !s.thread.isRunning}>
            <AssistantActionBar />
          </AuiIf>
        </View>
      </View>
    </MessagePrimitive.Root>
  );
}

function AssistantActionBar() {
  const [moreOpen, setMoreOpen] = useState(false);
  const iconColor = useCSSVariable("--color-muted-foreground") as string;

  return (
    <View className="flex-row items-center gap-1 mt-1.5">
      <ActionBarPrimitive.Copy copiedDuration={2000}>
        {({ isCopied }: { isCopied: boolean }) => (
          <View className="w-7 h-7 rounded-full justify-center items-center">
            <Feather
              name={isCopied ? "check" : "copy"}
              size={14}
              color={iconColor}
            />
          </View>
        )}
      </ActionBarPrimitive.Copy>

      <ActionBarPrimitive.Reload>
        <View className="w-7 h-7 rounded-full justify-center items-center">
          <Feather name="refresh-cw" size={14} color={iconColor} />
        </View>
      </ActionBarPrimitive.Reload>

      <Pressable
        onPress={() => setMoreOpen(true)}
        className="w-7 h-7 rounded-full justify-center items-center"
      >
        <Feather name="more-horizontal" size={14} color={iconColor} />
      </Pressable>

      <MoreMenu visible={moreOpen} onClose={() => setMoreOpen(false)} />
    </View>
  );
}

function MoreMenu({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40" onPress={onClose}>
        <View className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl pt-2 pb-10">
          <View className="w-10 h-1 bg-border rounded-full self-center mb-2" />
          {/* Future actions go here */}
        </View>
      </Pressable>
    </Modal>
  );
}
