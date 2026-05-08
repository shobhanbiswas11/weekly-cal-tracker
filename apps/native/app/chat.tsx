import { C, EmptyState, Header, MessageBubble } from "@/components/chat";
import { useAppRuntime } from "@/hooks/use-app-runtime";
import type { ThreadMessage } from "@assistant-ui/react-native";
import {
  AssistantRuntimeProvider,
  useAui,
  useAuiState,
} from "@assistant-ui/react-native";
import { memo, useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const Composer = memo(function Composer() {
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
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 8,
        backgroundColor: C.bg,
        borderTopWidth: 1,
        borderTopColor: C.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.inputBg,
          borderRadius: 26,
          paddingLeft: 18,
          paddingRight: 6,
          paddingVertical: 6,
          minHeight: 52,
        }}
      >
        <TextInput
          ref={inputRef}
          onChangeText={handleChangeText}
          placeholder="Message"
          placeholderTextColor={C.textSecondary}
          multiline
          style={{
            flex: 1,
            fontSize: 16,
            color: C.textPrimary,
            lineHeight: 22,
            maxHeight: 120,
            paddingVertical: 6,
          }}
        />
        <Pressable
          onPress={handleSend}
          disabled={!hasText}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: !hasText ? C.sendInactive : C.sendActive,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
            alignSelf: "flex-end",
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "700",
              marginTop: -1,
            }}
          >
            ↑
          </Text>
        </Pressable>
      </View>
    </View>
  );
});

function ChatContent() {
  const messages = useAuiState(
    (s) => s.thread.messages,
  ) as readonly ThreadMessage[];

  const { height } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value - 30,
  }));

  return (
    <Animated.View style={[{ flex: 1, backgroundColor: C.bg }, animatedStyle]}>
      <Header />
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={messages}
          extraData={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}
          keyboardDismissMode="interactive"
        />
      )}
      <Composer />
    </Animated.View>
  );
}

export default function ChatModal() {
  const runtime = useAppRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <ChatContent />
      </SafeAreaView>
    </AssistantRuntimeProvider>
  );
}
