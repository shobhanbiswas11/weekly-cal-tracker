import { ThreadPrimitive, useAuiState } from "@assistant-ui/react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, type LayoutChangeEvent, View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { AssistantMessage } from "./assistant-message";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { Header } from "./header";
import { UserMessage } from "./user-message";

const SCROLL_OFFSET = 12;
const SCROLL_RETRY_DELAY = 100;

const messageComponents = {
  UserMessage,
  AssistantMessage,
};

const ListHeader = <View style={{ height: SCROLL_OFFSET }} />;

function findLatestUserMsgIndex(messages: readonly { role: string }[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return i;
  }
  return -1;
}

export function Thread({
  onOpenThreadList,
}: {
  onOpenThreadList?: () => void;
}) {
  const { height } = useReanimatedKeyboardAnimation();
  const listRef = useRef<FlatList>(null);
  const [listHeight, setListHeight] = useState(0);
  const messages = useAuiState((s) => s.thread.messages);

  const latestUserMsgIndex = useMemo(
    () => findLatestUserMsgIndex(messages),
    [messages],
  );

  useEffect(() => {
    if (latestUserMsgIndex === -1) return;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: latestUserMsgIndex,
        animated: true,
        viewPosition: 0,
        viewOffset: SCROLL_OFFSET,
      });
    });
  }, [latestUserMsgIndex]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
        viewPosition: 0,
        viewOffset: SCROLL_OFFSET,
      });
    }, SCROLL_RETRY_DELAY);
  }, []);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => setListHeight(e.nativeEvent.layout.height),
    [],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value - 30,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <View className="flex-1 bg-background">
        <Header onOpenThreadList={onOpenThreadList} />
        <ThreadPrimitive.Messages
          {...({ ref: listRef } as any)}
          contentContainerStyle={{ flexGrow: 1 }}
          style={{ flex: 1 }}
          components={messageComponents}
          keyboardDismissMode="interactive"
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          ListFooterComponent={
            <View
              style={{
                height: messages.length > 0 ? listHeight : SCROLL_OFFSET,
              }}
            />
          }
          onLayout={handleLayout}
          onScrollToIndexFailed={handleScrollToIndexFailed}
        />
        <Composer />
      </View>
    </Animated.View>
  );
}
