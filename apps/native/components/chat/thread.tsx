import { ThreadPrimitive, useAuiState } from "@assistant-ui/react-native";
import { useRef, useState } from "react";
import { FlatList, type LayoutChangeEvent, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { AssistantMessage } from "./assistant-message";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { Header } from "./header";
import { ScrollProvider } from "./scroll-context";
import { UserMessage } from "./user-message";

export function Thread() {
  const { height } = useReanimatedKeyboardAnimation();
  const flatListRef = useRef<FlatList>(null);
  const [listHeight, setListHeight] = useState(0);
  const hasMessages = useAuiState((s) => s.thread.messages.length > 0);

  const contentStyle = hasMessages
    ? { paddingTop: 16, paddingBottom: 8 }
    : { paddingTop: 16, paddingBottom: 8, flexGrow: 1 };

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value - 30,
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setListHeight(e.nativeEvent.layout.height);
  };

  return (
    <ScrollProvider value={flatListRef}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <View className="flex-1 bg-background">
          <Header />
          <ThreadPrimitive.Messages
            {...({ ref: flatListRef } as any)}
            components={{
              UserMessage,
              AssistantMessage,
            }}
            contentContainerStyle={contentStyle}
            keyboardDismissMode="interactive"
            ListEmptyComponent={EmptyState}
            ListFooterComponent={
              listHeight > 0 && hasMessages ? (
                <View style={{ height: listHeight - 100 }} />
              ) : null
            }
            onLayout={handleLayout}
            style={{ flex: 1 }}
          />
          <Composer />
        </View>
      </Animated.View>
    </ScrollProvider>
  );
}
