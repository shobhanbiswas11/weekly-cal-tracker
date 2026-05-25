import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, type ReactNode } from "react";
import { Pressable, Text } from "react-native";

export function IconButton({
  onPress,
  disabled = false,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.3 : pressed ? 0.5 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
      })}
    >
      {children}
    </Pressable>
  );
}

export function IconButtonIcon({
  name,
  size = 20,
  color = "#9ca3af",
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

export function IconButtonLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <Text className={className}>{children}</Text>;
}
