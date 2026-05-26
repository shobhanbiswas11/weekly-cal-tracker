import { Button, StyledSafeAreaView } from "@/components";
import { useInvalidateSummaryQuery, useSummaryQuery } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type {
  ActivityLevel,
  BiologicalSex,
  CreateProfileDto,
  Goal,
  HeightUnit,
  UpdateProfileDto,
  WeightUnit,
} from "@weekly-cal/core";
import {
  heightFromCm,
  heightToCm,
  schemaActivityLevel,
  schemaBiologicalSex,
  schemaGoal,
  weightFromKg,
  weightToKg,
  weightUnitLabel,
} from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { router } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useCSSVariable } from "uniwind";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Form types
// ---------------------------------------------------------------------------

type VitalsFormValues = {
  name: string;
  dateOfBirth: string;
  biologicalSex: BiologicalSex;
  /** cm value (used when heightUnit === "cm") */
  height: string;
  /** feet part (used when heightUnit === "ft") */
  heightFeet: string;
  /** inches part 0-11 (used when heightUnit === "ft") */
  heightInches: string;
  weight: string;
  activityLevel: ActivityLevel;
  goal: Goal;
  additionalNotes?: string;
};

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
  onBlur,
  placeholder,
  keyboardType = "default",
  multiline = false,
  isLast = false,
  foregroundColor,
  placeholderColor,
  error,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad";
  multiline?: boolean;
  isLast?: boolean;
  foregroundColor: string;
  placeholderColor: string;
  error?: string;
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
        onBlur={onBlur}
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
      {error && <Text className="text-xs text-destructive mt-1">{error}</Text>}
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
        <Button
          key={opt}
          variant={value === opt ? "default" : "outline"}
          size="lg"
          onPress={() => onChange(opt)}
          className="flex-1"
        >
          {opt}
        </Button>
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
        <Button
          key={opt}
          variant={value === opt ? "default" : "outline"}
          size="lg"
          onPress={() => onChange(opt)}
          className="items-start"
        >
          {opt}
        </Button>
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
  const heightUnit: HeightUnit = profile?.preferences?.heightUnit ?? "cm";
  const weightUnit: WeightUnit = profile?.preferences?.weightUnit ?? "kg";

  const schemaVitalsForm = useMemo(
    () =>
      z.object({
        name: z.string().min(1, "Name is required"),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
        biologicalSex: schemaBiologicalSex,
        height:
          heightUnit === "cm"
            ? z.string().refine((v) => {
                const n = parseFloat(v);
                return !isNaN(n) && n > 0;
              }, "Enter a valid height")
            : z.string(),
        heightFeet:
          heightUnit === "ft"
            ? z.string().refine((v) => {
                const n = parseInt(v, 10);
                return !isNaN(n) && n >= 0;
              }, "Enter valid feet")
            : z.string(),
        heightInches:
          heightUnit === "ft"
            ? z.string().refine((v) => {
                const n = parseInt(v, 10);
                return !isNaN(n) && n >= 0 && n < 12;
              }, "Enter 0–11")
            : z.string(),
        weight: z.string().refine((v) => {
          const n = parseFloat(v);
          return !isNaN(n) && n > 0;
        }, "Enter a valid weight"),
        activityLevel: schemaActivityLevel,
        goal: schemaGoal,
        additionalNotes: z.string().optional(),
      }),
    [heightUnit],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(schemaVitalsForm),
    defaultValues: {
      name: profile?.name ?? "",
      dateOfBirth: profile?.dateOfBirth ?? "",
      biologicalSex: profile?.biologicalSex ?? "Male",
      height:
        heightUnit === "cm" && profile?.height != null
          ? String(heightFromCm(profile.height, heightUnit))
          : "",
      heightFeet: (() => {
        if (heightUnit !== "ft" || profile?.height == null) return "";
        const totalInches = heightFromCm(profile.height, "ft");
        return String(Math.floor(totalInches / 12));
      })(),
      heightInches: (() => {
        if (heightUnit !== "ft" || profile?.height == null) return "";
        const totalInches = heightFromCm(profile.height, "ft");
        return String(totalInches % 12);
      })(),
      weight:
        profile?.weight != null
          ? String(weightFromKg(profile.weight, weightUnit))
          : "",
      activityLevel: profile?.activityLevel ?? "Moderately Active",
      goal: profile?.goal ?? "Maintain Healthy Lifestyle",
      additionalNotes: profile?.additionalNotes ?? "",
    },
  });

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

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      name: values.name.trim(),
      dateOfBirth: values.dateOfBirth,
      biologicalSex: values.biologicalSex,
      height:
        heightUnit === "ft"
          ? heightToCm(
              parseInt(values.heightFeet ?? "0", 10) * 12 +
                parseInt(values.heightInches ?? "0", 10),
              "ft",
            )
          : heightToCm(parseFloat(values.height ?? "0"), "cm"),
      weight: weightToKg(parseFloat(values.weight), weightUnit),
      activityLevel: values.activityLevel,
      goal: values.goal,
      additionalNotes: values.additionalNotes?.trim() || undefined,
    });
  });

  const isSaving = mutation.isPending;

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      {/* Custom modal header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border">
        <Button variant="ghost" size="lg" onPress={() => router.back()}>
          Cancel
        </Button>
        <Text className="text-base font-semibold text-foreground">
          Edit Vitals
        </Text>
        <Button
          variant="ghost-primary"
          size="lg"
          onPress={onSubmit}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
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
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <InputRow
                  label="Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Your full name"
                  error={errors.name?.message}
                  foregroundColor={foregroundColor}
                  placeholderColor={placeholderColor}
                />
              )}
            />
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }) => (
                <InputRow
                  label="Date of Birth"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="YYYY-MM-DD"
                  isLast
                  error={errors.dateOfBirth?.message}
                  foregroundColor={foregroundColor}
                  placeholderColor={placeholderColor}
                />
              )}
            />
          </View>

          {/* Biological Sex */}
          <SectionHeader title="Biological Sex" />
          <Controller
            control={control}
            name="biologicalSex"
            render={({ field }) => (
              <BinaryToggle
                options={
                  schemaBiologicalSex.options as [BiologicalSex, BiologicalSex]
                }
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Body Measurements */}
          <SectionHeader title="Body Measurements" />
          <View className="rounded-2xl bg-card border border-border px-4 py-2 overflow-hidden">
            {heightUnit === "ft" ? (
              <View
                style={{ borderBottomWidth: 1, paddingVertical: 4 }}
                className="border-border"
              >
                <Text className="text-xs text-muted-foreground mb-1 mt-1">
                  Height (ft / in)
                </Text>
                <View className="flex-row gap-6">
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="heightFeet"
                      render={({ field }) => (
                        <>
                          <TextInput
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="5"
                            placeholderTextColor={placeholderColor}
                            keyboardType="number-pad"
                            style={{
                              color: foregroundColor,
                              fontSize: 15,
                              paddingVertical: 2,
                            }}
                          />
                          <Text className="text-xs text-muted-foreground mt-0.5">
                            ft
                          </Text>
                          {errors.heightFeet && (
                            <Text className="text-xs text-destructive mt-1">
                              {errors.heightFeet.message as string}
                            </Text>
                          )}
                        </>
                      )}
                    />
                  </View>
                  <View className="flex-1">
                    <Controller
                      control={control}
                      name="heightInches"
                      render={({ field }) => (
                        <>
                          <TextInput
                            value={field.value ?? ""}
                            onChangeText={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="6"
                            placeholderTextColor={placeholderColor}
                            keyboardType="number-pad"
                            style={{
                              color: foregroundColor,
                              fontSize: 15,
                              paddingVertical: 2,
                            }}
                          />
                          <Text className="text-xs text-muted-foreground mt-0.5">
                            in
                          </Text>
                          {errors.heightInches && (
                            <Text className="text-xs text-destructive mt-1">
                              {errors.heightInches.message as string}
                            </Text>
                          )}
                        </>
                      )}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <Controller
                control={control}
                name="height"
                render={({ field }) => (
                  <InputRow
                    label="Height (cm)"
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="e.g. 175"
                    keyboardType="decimal-pad"
                    error={errors.height?.message}
                    foregroundColor={foregroundColor}
                    placeholderColor={placeholderColor}
                  />
                )}
              />
            )}
            <Controller
              control={control}
              name="weight"
              render={({ field }) => (
                <InputRow
                  label={`Weight (${weightUnitLabel(weightUnit)})`}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={weightUnit === "lbs" ? "e.g. 154" : "e.g. 70"}
                  keyboardType="decimal-pad"
                  isLast
                  error={errors.weight?.message}
                  foregroundColor={foregroundColor}
                  placeholderColor={placeholderColor}
                />
              )}
            />
          </View>

          {/* Activity Level */}
          <SectionHeader title="Activity Level" />
          <Controller
            control={control}
            name="activityLevel"
            render={({ field }) => (
              <OptionPicker
                options={ACTIVITY_LEVELS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Goal */}
          <SectionHeader title="Goal" />
          <Controller
            control={control}
            name="goal"
            render={({ field }) => (
              <OptionPicker
                options={GOALS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Notes */}
          <SectionHeader title="Notes (optional)" />
          <View className="rounded-2xl bg-card border border-border px-4 py-2 overflow-hidden">
            <Controller
              control={control}
              name="additionalNotes"
              render={({ field }) => (
                <InputRow
                  label="Additional notes (dietary restrictions, health conditions, etc.)"
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="e.g. lactose intolerant, vegetarian…"
                  multiline
                  isLast
                  foregroundColor={foregroundColor}
                  placeholderColor={placeholderColor}
                />
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
