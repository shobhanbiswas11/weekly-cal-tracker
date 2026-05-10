import { Keyboard, Pressable, Text, View } from "react-native";

export function EmptyState() {
  return (
    <Pressable
      className="flex-1 justify-center items-center px-8 pb-15"
      onPress={Keyboard.dismiss}
    >
      <View className="w-15 h-15 rounded-full bg-primary justify-center items-center mb-5.5">
        <Text className="text-primary-foreground text-3xl font-bold">✦</Text>
      </View>
      <Text className="text-2xl font-semibold text-foreground mb-2.5 text-center">
        How can I help you?
      </Text>
      <Text className="text-base text-muted-foreground text-center leading-5.5">
        Ask me about your calories, macros, or nutrition goals.
      </Text>
    </Pressable>
  );
}
