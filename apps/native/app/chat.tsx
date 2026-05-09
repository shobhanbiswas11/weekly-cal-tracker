import { EmptyState, Header, MessageBubble } from "@/components/chat";
import { useAssistantRuntime } from "@/hooks/use-assistant-runtime";
import type { ThreadMessage } from "@assistant-ui/react-native";
import {
  AssistantRuntimeProvider,
  useAui,
  useAuiState,
} from "@assistant-ui/react-native";
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const listContentStyle = { paddingTop: 16, paddingBottom: 8 };

const Composer = function Composer() {
  const { theme } = useUnistyles();
  const aui = useAui();
  const inputRef = useRef<TextInput>(null);
  const textRef = useRef("");
  const [hasText, setHasText] = useState(false);

  const handleChangeText = useCallback((t: string) => {
    textRef.current = t;
    setHasText(t.length > 0);
  }, []);

  const handleSend = useCallback(() => {
    const t = textRef.current.trim();
    if (!t) return;
    aui.composer().setText(t);
    aui.composer().send();
    inputRef.current?.clear();
    textRef.current = "";
    setHasText(false);
  }, [aui]);

  return (
    <View style={styles.composerOuter}>
      <View style={styles.composerInner}>
        <TextInput
          ref={inputRef}
          onChangeText={handleChangeText}
          placeholder="Message"
          placeholderTextColor={theme.colors.mutedForeground}
          multiline
          style={styles.composerInput}
        />
        <Pressable
          onPress={handleSend}
          disabled={!hasText}
          style={styles.sendButton(hasText)}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
};

function ChatContent() {
  const messages = useAuiState(
    (s) => s.thread.messages,
  ) as readonly ThreadMessage[];

  const { height } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value - 30,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <View style={styles.chatContent}>
        <Header />
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={messages}
            extraData={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            contentContainerStyle={listContentStyle}
            keyboardDismissMode="interactive"
          />
        )}
        <Composer />
      </View>
    </Animated.View>
  );
}

export default function ChatModal() {
  const runtime = useAssistantRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SafeAreaView style={{ flex: 1 }}>
        <ChatContent />
      </SafeAreaView>
    </AssistantRuntimeProvider>
  );
}

const styles = StyleSheet.create((theme) => ({
  chatContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  composerOuter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  composerInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: 26,
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 52,
  },
  composerInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.foreground,
    lineHeight: 22,
    maxHeight: 120,
    paddingVertical: 6,
  },
  sendButton: (active: boolean) => ({
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: active ? theme.colors.fill : theme.colors.fillDisabled,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    alignSelf: "flex-end",
    marginBottom: 2,
  }),
  sendIcon: {
    color: theme.colors.fillForeground,
    fontSize: 18,
    fontWeight: "700",
    marginTop: -1,
  },
}));
