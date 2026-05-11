import { ThreadPrimitive } from "@assistant-ui/react-native";
import { View } from "react-native";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { AssistantMessage } from "./assistant-message";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";
import { Header } from "./header";
import { EditComposer, UserMessage } from "./user-message";

const listContentStyle = { paddingTop: 16, paddingBottom: 8 };

export function Thread() {
  const { height } = useReanimatedKeyboardAnimation();

  const animatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value - 30,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <View className="flex-1 bg-background">
        <Header />
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
            UserEditComposer: EditComposer,
          }}
          contentContainerStyle={listContentStyle}
          keyboardDismissMode="interactive"
          ListEmptyComponent={EmptyState}
          style={{ flex: 1 }}
        />
        <Composer />
      </View>
    </Animated.View>
  );
}
