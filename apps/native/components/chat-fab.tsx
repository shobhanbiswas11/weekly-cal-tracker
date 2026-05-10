import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useCSSVariable } from "uniwind";

export function ChatFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPressed, setIsPressed] = useState(false);
  const iconColor = useCSSVariable("--color-primary-foreground") as string;

  if (pathname === "/chat") return null;

  return (
    <Pressable
      onPress={() => router.push("/chat")}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`absolute bottom-10 right-6 w-14 h-14 rounded-full shadow-lg ${isPressed ? "opacity-90 scale-95" : "opacity-100 scale-100"}`}
      accessibilityLabel="Open chat assistant"
      accessibilityRole="button"
    >
      <View className="flex-1 w-full rounded-full bg-primary justify-center items-center">
        <Ionicons name="chatbubble" size={26} color={iconColor} />
      </View>
    </Pressable>
  );
}
