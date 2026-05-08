import type { ThreadMessage } from "@assistant-ui/react-native";
import { Text, View } from "react-native";
import { AssistantAvatar } from "./AssistantAvatar";
import { C } from "./constants";

export function MessageBubble({ message }: { message: ThreadMessage }) {
  const isUser = message.role === "user";
  const text = message.content
    .filter((p) => p.type === "text")
    .map((p) => ("text" in p ? p.text : ""))
    .join("\n");

  if (!text) return null;

  if (isUser) {
    return (
      <View
        style={{
          alignSelf: "flex-end",
          backgroundColor: C.userBubble,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginVertical: 2,
          marginHorizontal: 16,
          maxWidth: "78%",
        }}
      >
        <Text style={{ color: C.textPrimary, fontSize: 16, lineHeight: 23 }}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginVertical: 2,
        maxWidth: "92%",
      }}
    >
      <AssistantAvatar />
      <Text
        style={{
          flex: 1,
          color: C.textPrimary,
          fontSize: 16,
          lineHeight: 24,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
