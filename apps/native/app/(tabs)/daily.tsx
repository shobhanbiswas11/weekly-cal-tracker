import { StyledSafeAreaView } from "@/components";
import { Text, View } from "react-native";

export default function DailyScreen() {
  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">Today</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>

        {/* Content TBD */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground text-sm">Coming soon</Text>
        </View>
      </View>
    </StyledSafeAreaView>
  );
}
