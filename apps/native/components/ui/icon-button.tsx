import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps } from "react";
import { Pressable } from "react-native";

export function IconButton({
  name,
  size = 20,
  color = "#9ca3af",
  onPress,
  disabled = false,
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => ({
        opacity: disabled ? 0.3 : pressed ? 0.5 : 1,
      })}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}
