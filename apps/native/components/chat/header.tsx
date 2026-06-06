import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ThreadListModal } from "./thread-list-modal";

export function Header() {
  const router = useRouter();

  return (
    <View className="border-b border-border bg-background">
      <View className="items-center pt-2 pb-1">
        <View className="w-9 h-1 rounded-full bg-muted-foreground/30" />
      </View>
      <View className="flex-row items-center justify-between py-3.5 px-4">
        <ThreadListModal>
          <Ionicons name="time-outline" size={22} color="#6b7280" />
        </ThreadListModal>
        <Text className="text-lg font-semibold text-foreground">
          Calorie Coach
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-primary font-medium">Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
