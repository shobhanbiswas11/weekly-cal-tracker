import {
  ActionBarPrimitive,
  AuiIf,
  MessagePrimitive,
} from "@assistant-ui/react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";
import { MessageContainer } from "./message-container";
import { ToolFallback } from "./tool-fallback";

export function AssistantMessage() {
  return (
    <MessageContainer>
      <View className="px-4 max-w-full">
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
          <TypingIndicator />
        </AuiIf>
        <AuiIf condition={(s) => !s.thread.isRunning || !s.message.isLast}>
          <AssistantActionBar />
        </AuiIf>
      </View>
    </MessageContainer>
  );
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseDuration = 300;
    const stagger = 250;
    const totalDuration = 1400;

    const makeDotAnim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.delay(totalDuration - delay - pulseDuration * 2),
        ]),
      );

    const anim = Animated.parallel([
      makeDotAnim(dot1, 0),
      makeDotAnim(dot2, stagger),
      makeDotAnim(dot3, stagger * 2),
    ]);
    anim.start();
    return () => anim.stop();
  }, [dot1, dot2, dot3]);

  return (
    <View className="flex-row gap-1.5 mt-3 self-start items-center h-5">
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={{ opacity: dot }}
          className="w-2 h-2 rounded-full bg-foreground"
        />
      ))}
    </View>
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
