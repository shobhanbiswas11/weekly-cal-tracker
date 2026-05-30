import { StyledSafeAreaView } from "@/components";
import { useRevenueCat } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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
    customerInfo,
    presentPaywall,
    presentCustomerCenter,
    restorePurchases,
  } = useRevenueCat();

  const mutedColor = useCSSVariable("--color-muted-foreground") as string;
  const primaryColor = useCSSVariable("--color-primary") as string;

  const activeSubscription = customerInfo?.activeSubscriptions?.[0];
  const expirationDate =
    customerInfo?.entitlements.active["Weekly Health Pro"]?.expirationDate;

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
        }}
        className="border-border"
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Ionicons name="chevron-back" size={24} color={mutedColor} />
        </Pressable>

        <Text className="text-base font-semibold text-foreground">
          Subscription
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        {isLoading ? (
          <ActivityIndicator size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Status Card */}
            <View
              style={{ borderRadius: 12, padding: 20, gap: 12 }}
              className="bg-card border border-border"
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
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
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                })}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                >
                  Upgrade to Pro
                </Text>
              </Pressable>
            )}

            {isProUser && (
              <Pressable
                onPress={presentCustomerCenter}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  alignItems: "center",
                  borderWidth: 1,
                })}
                className="border-border"
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
              style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                paddingVertical: 14,
                alignItems: "center",
              })}
            >
              <Text className="text-sm text-muted-foreground underline">
                Restore Purchases
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </StyledSafeAreaView>
  );
}
