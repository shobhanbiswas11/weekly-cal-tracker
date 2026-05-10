import type { ThreadMessage } from "@assistant-ui/react-native";
import { Text, View } from "react-native";
import { AssistantAvatar } from "./AssistantAvatar";

export function MessageBubble({ message }: { message: ThreadMessage }) {
  const isUser = message.role === "user";
  const text = message.content
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("\n");

  if (!text) return null;

  if (isUser) {
    return (
      <View className="self-end bg-card rounded-[20px] px-4 py-2.5 my-0.5 mx-4 max-w-[78%]">
        <Text className="text-foreground text-base leading-5.75">{text}</Text>
      </View>
    );
  }

  return (
    <View className="flex-row items-start px-4 py-1.5 my-0.5 max-w-[92%]">
      <AssistantAvatar />
      <Text className="flex-1 text-foreground text-base leading-6">{text}</Text>
    </View>
  );
}
