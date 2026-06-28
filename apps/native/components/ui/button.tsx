import { type ReactNode } from "react";
import { Pressable, Text } from "react-native";

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------
// "default"       — filled primary bg, primary-foreground text
// "outline"       — card bg with border, muted-foreground text
// "ghost"         — no bg, muted-foreground text (nav bar Cancel-style)
// "ghost-primary" — no bg, primary text semibold (nav bar Save-style)
// ---------------------------------------------------------------------------

type ButtonVariant = "default" | "outline" | "ghost" | "ghost-primary";
type ButtonSize = "sm" | "md" | "lg";

const containerClass: Record<ButtonVariant, string> = {
  default: "bg-primary border border-primary rounded-xl items-center",
  outline: "bg-card border border-border rounded-xl items-center",
  ghost: "",
  "ghost-primary": "",
};

const textClass: Record<ButtonVariant, string> = {
  default: "text-primary-foreground font-medium",
  outline: "text-muted-foreground font-medium",
  ghost: "text-muted-foreground",
  "ghost-primary": "text-primary font-semibold",
};

const paddingClass: Record<ButtonSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-2.5",
  lg: "px-4 py-3",
};

const textSizeClass: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
};

export function Button({
  children,
  onPress,
  disabled = false,
  variant = "default",
  size = "md",
  className,
  testID,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  testID?: string;
}) {
  const isGhost = variant === "ghost" || variant === "ghost-primary";

  return (
    <Pressable
      testID={testID}
      onPress={disabled ? undefined : onPress}
      hitSlop={isGhost ? { top: 8, bottom: 8, left: 8, right: 8 } : undefined}
      style={({ pressed }) => ({
        opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
      })}
      className={`${containerClass[variant]} ${isGhost ? "" : paddingClass[size]} ${className ?? ""}`}
    >
      {typeof children === "string" ? (
        <Text className={`${textClass[variant]} ${textSizeClass[size]}`}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
