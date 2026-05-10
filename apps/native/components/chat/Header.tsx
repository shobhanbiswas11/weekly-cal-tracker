import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function Header() {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between py-3.5 px-4 border-b border-border bg-background">
      <View className="w-11" />
      <Text className="text-lg font-semibold text-foreground">
        Calorie Coach
      </Text>
      <Pressable onPress={() => router.back()}>
        <Text className="text-base text-primary font-medium">Done</Text>
      </Pressable>
    </View>
  );
}
