import type { ThreadMessage } from "@assistant-ui/react-native";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
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
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{text}</Text>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <AssistantAvatar />
      <Text style={styles.assistantText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 2,
    marginHorizontal: 16,
    maxWidth: "78%",
  },
  userText: {
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 23,
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 2,
    maxWidth: "92%",
  },
  assistantText: {
    flex: 1,
    color: theme.colors.foreground,
    fontSize: 16,
    lineHeight: 24,
  },
}));
