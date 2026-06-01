import { NavHeader, ScreenLayout } from "@/components";
import { IconButton, IconButtonLabel } from "@/components/ui/icon-button";
import { useSummaryQuery } from "@/hooks";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

function PrefRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
      }}
      className="border-border"
    >
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium text-foreground">{value}</Text>
    </View>
  );
}

export default function PreferencesScreen() {
  const { data, isLoading } = useSummaryQuery();

  const preferences = data?.profile?.preferences;

  return (
    <ScreenLayout>
      <NavHeader>
        <NavHeader.BackButton />
        <NavHeader.Title>Preferences</NavHeader.Title>
        <NavHeader.Right>
          {preferences && (
            <IconButton
              onPress={() => router.push("/profile/edit-preferences")}
            >
              <IconButtonLabel className="text-sm font-medium text-primary">
                Edit
              </IconButtonLabel>
            </IconButton>
          )}
        </NavHeader.Right>
      </NavHeader>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 24 }}
      >
        <View className="rounded-2xl bg-card border border-border overflow-hidden px-4">
          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="small" />
            </View>
          ) : preferences ? (
            <>
              <PrefRow
                label="Height unit"
                value={preferences.heightUnit === "ft" ? "ft / in" : "cm"}
              />
              <PrefRow
                label="Weight unit"
                value={preferences.weightUnit === "lbs" ? "lbs" : "kg"}
                isLast
              />
            </>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                Configure you profile first
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
