import { NavHeader, ScreenLayout } from "@/components";
import { useSubscription } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useCSSVariable } from "uniwind";

export default function SubscriptionScreen() {
  const {
    isProUser,
    isLoading,
    activeSubscription,
    expirationDate,
    presentPaywall,
    manageSubscription,
    restorePurchases,
  } = useSubscription();

  const primaryColor = useCSSVariable("--color-primary") as string;

  return (
    <ScreenLayout>
      <NavHeader>
        <NavHeader.BackButton />
        <NavHeader.Title>Subscription</NavHeader.Title>
        <NavHeader.Right />
      </NavHeader>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        {isLoading ? (
          <ActivityIndicator size="large" className="mt-10" />
        ) : (
          <>
            {/* Status Card */}
            <View className="bg-card border border-border rounded-xl p-5 gap-3">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={isProUser ? "star" : "star-outline"}
                  size={24}
                  color={primaryColor}
                />
                <Text className="text-lg font-semibold text-foreground">
                  {isProUser ? "Weekly Health Pro" : "Free Plan"}
                </Text>
              </View>

              {isProUser && activeSubscription && (
                <Text className="text-sm text-muted-foreground">
                  Plan: {activeSubscription}
                </Text>
              )}

              {isProUser && expirationDate && (
                <Text className="text-sm text-muted-foreground">
                  Renews: {new Date(expirationDate).toLocaleDateString()}
                </Text>
              )}

              {!isProUser && (
                <Text className="text-sm text-muted-foreground">
                  Upgrade to Pro for unlimited access to all features.
                </Text>
              )}
            </View>

            {/* Actions */}
            {!isProUser && (
              <Pressable
                onPress={presentPaywall}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  backgroundColor: primaryColor,
                })}
                className="py-3.5 rounded-[10px] items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Upgrade to Pro
                </Text>
              </Pressable>
            )}

            {isProUser && (
              <Pressable
                onPress={manageSubscription}
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                className="py-3.5 rounded-[10px] items-center border border-border"
              >
                <Text className="text-foreground font-semibold text-base">
                  Manage Subscription
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={async () => {
                try {
                  await restorePurchases();
                } catch {
                  // Error already logged in hook
                }
              }}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="py-3.5 items-center"
            >
              <Text className="text-sm text-muted-foreground underline">
                Restore Purchases
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
