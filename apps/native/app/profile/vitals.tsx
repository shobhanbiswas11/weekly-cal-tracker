import { NavHeader, ScreenLayout } from "@/components";
import { IconButton, IconButtonLabel } from "@/components/ui/icon-button";
import { useSummaryQuery } from "@/hooks";
import { calcAge, formatHeight, formatWeight } from "@weekly-cal/core";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function VitalRow({
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

export default function VitalsScreen() {
  const { data, isLoading } = useSummaryQuery();

  const profile = data?.profile;

  return (
    <ScreenLayout>
      <NavHeader>
        <NavHeader.BackButton />
        <NavHeader.Title>Vitals</NavHeader.Title>
        <NavHeader.Right>
          {profile && (
            <IconButton onPress={() => router.push("/profile/edit-vitals")}>
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
          ) : profile ? (
            <>
              <VitalRow
                label="Height"
                value={formatHeight(
                  profile.height,
                  profile.preferences.heightUnit,
                )}
              />
              <VitalRow
                label="Weight"
                value={formatWeight(
                  profile.weight,
                  profile.preferences.weightUnit,
                )}
              />
              <VitalRow
                label="Age"
                value={`${calcAge(profile.dateOfBirth)} y`}
              />
              <VitalRow label="Sex" value={profile.biologicalSex} />
              <VitalRow label="Activity" value={profile.activityLevel} />
              <VitalRow label="Goal" value={profile.goal} isLast />
            </>
          ) : (
            <View className="py-10 items-center gap-3">
              <Text className="text-sm text-muted-foreground text-center">
                No vitals configured yet.
              </Text>
              <Pressable
                onPress={() => router.push("/profile/edit-vitals")}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                className="bg-primary px-5 py-2.5 rounded-xl"
              >
                <Text className="text-sm font-semibold text-primary-foreground">
                  Set Up Your Vitals
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
