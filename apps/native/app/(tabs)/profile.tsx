import { StyledSafeAreaView } from "@/components";
import { useAppAuth, useCreateApiClient, useSummaryQuery } from "@/hooks";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useCSSVariable } from "uniwind";

function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].substring(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { username, avatarUrl, email } = useAppAuth();
  const { data } = useSummaryQuery();
  const mutedColor = useCSSVariable("--color-muted-foreground") as string;
  const apiClient = useCreateApiClient();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const profile = data?.profile;
  const displayName = profile?.name ?? username ?? "You";

  function confirmDeleteAccount() {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingAccount(true);
            try {
              await apiClient.deleteAccount();
              await signOut();
            } catch (e) {
              setDeletingAccount(false);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
              );
            }
          },
        },
      ],
    );
  }

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 48 }}
      >
        {/* Avatar + name */}
        <View className="items-center pt-4 pb-6 px-4">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              contentFit="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-full bg-primary items-center justify-center">
              <Text className="text-2xl font-bold text-primary-foreground">
                {getInitials(displayName)}
              </Text>
            </View>
          )}
          <Text className="mt-3 text-xl font-bold text-foreground">
            {displayName}
          </Text>
          {email ? (
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {email}
            </Text>
          ) : null}
        </View>

        {/* Vitals row */}
        <View className="mx-4 rounded-2xl bg-card border border-border overflow-hidden">
          <Pressable
            onPress={() => router.push("/profile/vitals")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="body-outline" size={20} color={mutedColor} />
              <Text className="text-base font-medium text-foreground">
                Vitals
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={mutedColor} />
          </Pressable>
        </View>

        {/* Preferences row */}
        <View className="mx-4 mt-3 rounded-2xl bg-card border border-border overflow-hidden">
          <Pressable
            onPress={() => router.push("/profile/preferences")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="settings-outline" size={20} color={mutedColor} />
              <Text className="text-base font-medium text-foreground">
                Preferences
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={mutedColor} />
          </Pressable>
        </View>

        {/* Subscription row */}
        <View className="mx-4 mt-3 rounded-2xl bg-card border border-border overflow-hidden">
          <Pressable
            onPress={() => router.push("/profile/subscription")}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="star-outline" size={20} color={mutedColor} />
              <Text className="text-base font-medium text-foreground">
                Subscription
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={mutedColor} />
          </Pressable>
        </View>

        {/* Legal */}
        <View className="mx-4 mt-3 rounded-2xl bg-card border border-border overflow-hidden">
          {(
            [
              {
                label: "Privacy Policy",
                url: "https://www.botobrain.com/privacy",
                icon: "shield-checkmark-outline",
              },
              {
                label: "Terms of Service",
                url: "https://www.botobrain.com/terms",
                icon: "document-text-outline",
              },
              {
                label: "Contact Us",
                url: "https://www.botobrain.com/contact",
                icon: "mail-outline",
              },
            ] as const
          ).map(({ label, url, icon }, index, arr) => (
            <View key={label}>
              <Pressable
                onPress={() => WebBrowser.openBrowserAsync(url)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.5 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                })}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Ionicons name={icon} size={20} color={mutedColor} />
                  <Text className="text-base font-medium text-foreground">
                    {label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={mutedColor} />
              </Pressable>
              {index < arr.length - 1 && (
                <View className="h-px bg-border mx-4" />
              )}
            </View>
          ))}
        </View>

        {/* About */}
        <View className="mx-4 mt-3 rounded-2xl bg-card border border-border overflow-hidden px-4 py-4">
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            className="mb-1"
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={mutedColor}
            />
            <Text className="text-base font-medium text-foreground">About</Text>
          </View>
          <Text className="text-sm text-muted-foreground mt-1">
            Weekly Health by{" "}
            <Text
              className="text-primary"
              onPress={() =>
                WebBrowser.openBrowserAsync("https://www.botobrain.com")
              }
            >
              botobrain.com
            </Text>
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            Version {Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
        </View>

        {/* Danger zone */}
        <View className="mx-4 mt-6 rounded-2xl bg-card border border-border overflow-hidden">
          <Pressable
            onPress={() => signOut()}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="text-base font-medium text-red-500">
                Sign Out
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={mutedColor} />
          </Pressable>

          <View className="h-px bg-border mx-4" />

          <Pressable
            onPress={confirmDeleteAccount}
            disabled={deletingAccount}
            style={({ pressed }) => ({
              opacity: pressed || deletingAccount ? 0.5 : 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
            })}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text className="text-base font-medium text-red-500">
                {deletingAccount ? "Deleting…" : "Delete Account"}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
