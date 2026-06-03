import { StyledSafeAreaView } from "@/components";
import {
  useInvalidateWeeklySummaryQuery,
  useWeeklySummaryQuery,
} from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import type {
  HeightUnit,
  UpdateProfileDto,
  WeightUnit,
} from "@weekly-cal/core";
import { schemaHeightUnit, schemaWeightUnit } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2 mt-6">
      {title}
    </Text>
  );
}

function BinaryToggle<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: [T, T];
  labels?: [string, string];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row gap-2 mt-1 mb-2">
      {options.map((opt, i) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flex: 1 })}
          className={`py-2.5 rounded-xl items-center border ${
            value === opt
              ? "bg-primary border-primary"
              : "bg-card border-border"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              value === opt
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {labels ? labels[i] : opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const HEIGHT_UNITS = schemaHeightUnit.options as [HeightUnit, HeightUnit];
const WEIGHT_UNITS = schemaWeightUnit.options as [WeightUnit, WeightUnit];

export default function EditPreferencesScreen() {
  const { data } = useWeeklySummaryQuery();
  const api = useApi();
  const invalidateSummary = useInvalidateWeeklySummaryQuery();

  const preferences = data?.profile?.preferences;

  const [form, setForm] = useState({
    heightUnit: (preferences?.heightUnit ?? "cm") as HeightUnit,
    weightUnit: (preferences?.weightUnit ?? "kg") as WeightUnit,
  });

  const set = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const mutation = useMutation({
    mutationFn: (dto: UpdateProfileDto) => api.updateProfile(dto),
    onSuccess: () => {
      invalidateSummary();
      router.back();
    },
    onError: (err) => {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save preferences.",
      );
    },
  });

  const handleSave = useCallback(() => {
    mutation.mutate({
      preferences: {
        heightUnit: form.heightUnit,
        weightUnit: form.weightUnit,
      },
    });
  }, [form, mutation]);

  const isSaving = mutation.isPending;

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Text className="text-base text-muted-foreground">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          Edit Preferences
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => ({ opacity: isSaving || pressed ? 0.5 : 1 })}
        >
          <Text className="text-base font-semibold text-primary">
            {isSaving ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
      >
        <SectionHeader title="Height Unit" />
        <BinaryToggle
          options={HEIGHT_UNITS}
          labels={["cm", "ft / in"]}
          value={form.heightUnit}
          onChange={(v) => set("heightUnit", v)}
        />

        <SectionHeader title="Weight Unit" />
        <BinaryToggle
          options={WEIGHT_UNITS}
          labels={["kg", "lbs"]}
          value={form.weightUnit}
          onChange={(v) => set("weightUnit", v)}
        />
      </ScrollView>
    </StyledSafeAreaView>
  );
}
