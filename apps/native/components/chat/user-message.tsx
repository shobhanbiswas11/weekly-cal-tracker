import { MessagePrimitive } from "@assistant-ui/react-native";
import { Text, View } from "react-native";
import { MessageContainer } from "./message-container";

export function UserMessage() {
  return (
    <MessageContainer>
      <View className="flex-row items-center justify-end px-4 pb-4">
        <View className="items-end" style={{ maxWidth: "78%" }}>
          <View className="bg-card rounded-xl px-4 py-2.5">
            <MessagePrimitive.Content
              renderText={({ part }) => (
                <Text className="text-foreground text-base leading-5.75">
                  {part.text}
                </Text>
              )}
            />
          </View>
        </View>
      </View>
    </MessageContainer>
  );
}
