import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

function NavHeaderRoot({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
      {children}
    </View>
  );
}

function BackButton({ onPress }: { onPress?: () => void }) {
  const mutedColor = useCSSVariable("--color-muted-foreground") as string;

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <Ionicons name="chevron-back" size={24} color={mutedColor} />
    </Pressable>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <Text className="text-base font-semibold text-foreground">{children}</Text>
  );
}

function Right({ children }: { children?: ReactNode }) {
  return (
    <View style={{ minWidth: 24, alignItems: "flex-end" }}>{children}</View>
  );
}

export const NavHeader = Object.assign(NavHeaderRoot, {
  BackButton,
  Title,
  Right,
});
