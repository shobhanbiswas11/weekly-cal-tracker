import { StyledSafeAreaView } from "@/components";
import { useInvalidateSummaryQuery, useSummaryQuery } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import type {
  ActivityLevel,
  BiologicalSex,
  CreateProfileDto,
  Goal,
  UpdateProfileDto,
} from "@weekly-cal/core";
import {
  schemaActivityLevel,
  schemaBiologicalSex,
  schemaGoal,
} from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCSSVariable } from "uniwind";

// ---------------------------------------------------------------------------
// Small reusable form primitives
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2 mt-6">
      {title}
    </Text>
  );
}

function InputRow({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
  isLast = false,
  foregroundColor,
  placeholderColor,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad";
  multiline?: boolean;
  isLast?: boolean;
  foregroundColor: string;
  placeholderColor: string;
}) {
  return (
    <View
      style={{
        borderBottomWidth: isLast ? 0 : 1,
        paddingVertical: 4,
      }}
      className="border-border"
    >
      <Text className="text-xs text-muted-foreground mb-1 mt-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={{
          color: foregroundColor,
          fontSize: 15,
          paddingVertical: multiline ? 6 : 2,
          minHeight: multiline ? 60 : undefined,
          textAlignVertical: multiline ? "top" : "auto",
        }}
      />
    </View>
  );
}

function BinaryToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: [T, T];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row gap-2 mt-1 mb-2">
      {options.map((opt) => (
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
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function OptionPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="gap-2 mt-1 mb-2">
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className={`px-4 py-3 rounded-xl border ${
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
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const ACTIVITY_LEVELS = schemaActivityLevel.options as ActivityLevel[];
const GOALS = schemaGoal.options as Goal[];

export default function EditVitalsScreen() {
  const { data } = useSummaryQuery();
  const api = useApi();
  const invalidateSummary = useInvalidateSummaryQuery();

  const profile = data?.profile;

  const [form, setForm] = useState(() => ({
    name: profile?.name ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    biologicalSex: (profile?.biologicalSex ?? "Male") as BiologicalSex,
    height: profile?.height?.toString() ?? "",
    weight: profile?.weight?.toString() ?? "",
    activityLevel: (profile?.activityLevel ??
      "Moderately Active") as ActivityLevel,
    goal: (profile?.goal ?? "Maintain Healthy Lifestyle") as Goal,
    additionalNotes: profile?.additionalNotes ?? "",
  }));

  const set = useCallback(
    <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const foregroundColor = useCSSVariable("--color-foreground") as string;
  const placeholderColor = useCSSVariable("--color-muted-foreground") as string;

  const mutation = useMutation({
    mutationFn: (dto: UpdateProfileDto) => {
      if (profile) return api.updateProfile(dto);
      return api.createProfile(dto as CreateProfileDto);
    },
    onSuccess: () => {
      invalidateSummary();
      router.back();
    },
    onError: (err) => {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to save vitals.",
      );
    },
  });

  const handleSave = useCallback(() => {
    const height = parseFloat(form.height);
    const weight = parseFloat(form.weight);

    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) {
      Alert.alert("Validation", "Date of birth must be in YYYY-MM-DD format.");
      return;
    }
    if (isNaN(height) || height <= 0) {
      Alert.alert("Validation", "Please enter a valid height in cm.");
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      Alert.alert("Validation", "Please enter a valid weight in kg.");
      return;
    }

    mutation.mutate({
      name: form.name.trim(),
      dateOfBirth: form.dateOfBirth,
      biologicalSex: form.biologicalSex,
      height,
      weight,
      activityLevel: form.activityLevel,
      goal: form.goal,
      additionalNotes: form.additionalNotes.trim() || undefined,
    });
  }, [form, mutation]);

  const isSaving = mutation.isPending;

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Custom modal header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Text className="text-base text-muted-foreground">Cancel</Text>
        </Pressable>
        <Text className="text-base font-semibold text-foreground">
          Edit Vitals
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Personal Details */}
          <SectionHeader title="Personal Details" />
          <View className="rounded-2xl bg-card border border-border px-4 py-2 overflow-hidden">
            <InputRow
              label="Name"
              value={form.name}
              onChangeText={(v) => set("name", v)}
              placeholder="Your full name"
              foregroundColor={foregroundColor}
              placeholderColor={placeholderColor}
            />
            <InputRow
              label="Date of Birth"
              value={form.dateOfBirth}
              onChangeText={(v) => set("dateOfBirth", v)}
              placeholder="YYYY-MM-DD"
              isLast
              foregroundColor={foregroundColor}
              placeholderColor={placeholderColor}
            />
          </View>

          {/* Biological Sex */}
          <SectionHeader title="Biological Sex" />
          <BinaryToggle
            options={
              schemaBiologicalSex.options as [BiologicalSex, BiologicalSex]
            }
            value={form.biologicalSex}
            onChange={(v) => set("biologicalSex", v)}
          />

          {/* Body Measurements */}
          <SectionHeader title="Body Measurements" />
          <View className="rounded-2xl bg-card border border-border px-4 py-2 overflow-hidden">
            <InputRow
              label="Height (cm)"
              value={form.height}
              onChangeText={(v) => set("height", v)}
              placeholder="e.g. 175"
              keyboardType="decimal-pad"
              foregroundColor={foregroundColor}
              placeholderColor={placeholderColor}
            />
            <InputRow
              label="Weight (kg)"
              value={form.weight}
              onChangeText={(v) => set("weight", v)}
              placeholder="e.g. 70"
              keyboardType="decimal-pad"
              isLast
              foregroundColor={foregroundColor}
              placeholderColor={placeholderColor}
            />
          </View>

          {/* Activity Level */}
          <SectionHeader title="Activity Level" />
          <OptionPicker
            options={ACTIVITY_LEVELS}
            value={form.activityLevel}
            onChange={(v) => set("activityLevel", v)}
          />

          {/* Goal */}
          <SectionHeader title="Goal" />
          <OptionPicker
            options={GOALS}
            value={form.goal}
            onChange={(v) => set("goal", v)}
          />

          {/* Notes */}
          <SectionHeader title="Notes (optional)" />
          <View className="rounded-2xl bg-card border border-border px-4 py-2 overflow-hidden">
            <InputRow
              label="Additional notes (dietary restrictions, health conditions, etc.)"
              value={form.additionalNotes}
              onChangeText={(v) => set("additionalNotes", v)}
              placeholder="e.g. lactose intolerant, vegetarian…"
              multiline
              isLast
              foregroundColor={foregroundColor}
              placeholderColor={placeholderColor}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
