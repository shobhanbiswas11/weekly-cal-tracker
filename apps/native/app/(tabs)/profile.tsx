import { StyledSafeAreaView } from "@/components";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-2xl font-bold text-foreground">Profile</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Your settings & info
        </Text>

        {/* Content TBD */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground text-sm">Coming soon</Text>
        </View>
      </View>
    </StyledSafeAreaView>
  );
}
