import type { ReactNode } from "react";
import { View } from "react-native";

export function ToolUIWrapper({ children }: { children: ReactNode }) {
  return <View className="my-3">{children}</View>;
}
