import { StyledSafeAreaView } from "@/components";
import { IconButton, IconButtonLabel } from "@/components/ui/icon-button";
import { useSummaryQuery } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import { calcAge } from "@weekly-cal/core";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useCSSVariable } from "uniwind";

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
  const mutedColor = useCSSVariable("--color-muted-foreground") as string;

  const profile = data?.profile;

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

        <Text className="text-base font-semibold text-foreground">Vitals</Text>

        <IconButton onPress={() => router.push("/profile/edit-vitals")}>
          <IconButtonLabel className="text-sm font-medium text-primary">
            Edit
          </IconButtonLabel>
        </IconButton>
      </View>

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
              <VitalRow label="Height" value={`${profile.height} cm`} />
              <VitalRow label="Weight" value={`${profile.weight} kg`} />
              <VitalRow
                label="Age"
                value={`${calcAge(profile.dateOfBirth)} y`}
              />
              <VitalRow label="Sex" value={profile.biologicalSex} />
              <VitalRow label="Activity" value={profile.activityLevel} />
              <VitalRow label="Goal" value={profile.goal} isLast />
            </>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-sm text-muted-foreground text-center">
                No vitals yet. Use the chat assistant to get started.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
