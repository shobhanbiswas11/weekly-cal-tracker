import { AuthView, StyledSafeAreaView } from "@/components";
import { useAppAuth } from "@/hooks/use-auth";
import { ActivityIndicator, Text, View } from "react-native";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAppAuth();

  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthView mode="signInOrUp" />;
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 pt-4">
        <Text className="text-[28px] font-bold text-foreground">Dashboard</Text>
        <Text className="text-[15px] text-muted-foreground mt-2">
          Your daily calorie overview
        </Text>
      </View>
    </StyledSafeAreaView>
  );
}
