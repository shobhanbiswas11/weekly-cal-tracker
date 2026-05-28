import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { Text, View } from "react-native";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={cn("bg-card rounded-2xl shadow-sm p-4 gap-4", className)}>
      {children}
    </View>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={cn("flex-col gap-1.5", className)}>{children}</View>;
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text className={cn("text-base font-semibold text-foreground", className)}>
      {children}
    </Text>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={cn(className)}>{children}</View>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn("border-t border-border flex-row items-center", className)}
    >
      {children}
    </View>
  );
}
