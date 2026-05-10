import { StyledSafeAreaView } from "@/components";
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
import { useCSSVariable } from "uniwind";

const listContentStyle = { paddingTop: 16, paddingBottom: 8 };

const Composer = function Composer() {
  const aui = useAui();
  const placeholderColor = useCSSVariable("--color-muted-foreground");
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
    <View className="px-4 pt-2.5 pb-2 bg-background border-t border-border">
      <View className="flex-row items-center bg-card rounded-[26px] pl-4.5 pr-1.5 py-1.5 min-h-13">
        <TextInput
          ref={inputRef}
          onChangeText={handleChangeText}
          placeholder="Message"
          placeholderTextColor={placeholderColor as string}
          multiline
          className="flex-1 text-base text-foreground leading-5.5 max-h-30 py-1.5"
        />
        <Pressable
          onPress={handleSend}
          disabled={!hasText}
          className={`w-9 h-9 rounded-full justify-center items-center ml-2 self-end mb-0.5 ${hasText ? "bg-fill" : "bg-fill-disabled"}`}
        >
          <Text className="text-fill-foreground text-[18px] font-bold -mt-px">
            ↑
          </Text>
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
      <View className="flex-1 bg-background">
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
      <StyledSafeAreaView className="flex-1 bg-background">
        <ChatContent />
      </StyledSafeAreaView>
    </AssistantRuntimeProvider>
  );
}
