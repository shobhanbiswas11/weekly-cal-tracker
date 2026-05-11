import { BranchPickerPrimitive } from "@assistant-ui/react-native";
import { Text, View } from "react-native";

export function BranchPicker() {
  return (
    <View className="flex-row items-center">
      <BranchPickerPrimitive.Previous>
        <Text className="text-muted-foreground px-1 text-sm">‹</Text>
      </BranchPickerPrimitive.Previous>
      <BranchPickerPrimitive.Number className="text-xs text-muted-foreground font-medium" />
      <Text className="text-xs text-muted-foreground mx-0.5">/</Text>
      <BranchPickerPrimitive.Count className="text-xs text-muted-foreground font-medium" />
      <BranchPickerPrimitive.Next>
        <Text className="text-muted-foreground px-1 text-sm">›</Text>
      </BranchPickerPrimitive.Next>
    </View>
  );
}
