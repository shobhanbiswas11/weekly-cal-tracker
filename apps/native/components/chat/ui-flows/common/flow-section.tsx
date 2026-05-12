import type { ReactNode } from "react";
import { Text, View } from "react-native";

interface FlowSectionProps {
  label: string;
  children: ReactNode;
}

export function FlowSection({ label, children }: FlowSectionProps) {
  return (
    <>
      <View style={{ height: 1 }} className="bg-border" />
      <View className="gap-2">
        <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </Text>
        {children}
      </View>
    </>
  );
}
