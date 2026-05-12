import { isCompleteOrCancelledUIFlow, uiFlowProfile } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { useState } from "react";
import { Text, View } from "react-native";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";
import type { UIFlowRendererProps } from "./types";

const fieldLabels: Record<string, string> = {
  name: "Name",
  dateOfBirth: "Date of Birth",
  biologicalSex: "Biological Sex",
  height: "Height",
  weight: "Weight",
  primaryGoal: "Primary Goal",
  additionalNotes: "Additional Notes",
  activityLevel: "Activity Level",
  bmr: "BMR",
  tdee: "TDEE",
  dailyCalorieTarget: "Daily Calorie Target",
  weeklyCalorieTarget: "Weekly Calorie Target",
  dailyCalorieAdjustment: "Daily Adjustment",
  proteinTarget: "Protein Target",
  carbsTarget: "Carbs Target",
  fatTarget: "Fat Target",
  targetWeight: "Target Weight",
  estimatedWeeklyWeightChange: "Est. Weekly Change",
  estimatedWeeksToGoal: "Est. Weeks to Goal",
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    if (key.includes("Calorie") || key === "bmr" || key === "tdee") {
      return `${value.toLocaleString()} kcal`;
    }
    if (
      key.includes("Target") &&
      key !== "dailyCalorieTarget" &&
      key !== "weeklyCalorieTarget"
    ) {
      return `${value}g`;
    }
    if (key === "targetWeight") return `${value} kg`;
    return value.toString();
  }
  return String(value);
}

export function UpdateProfile({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useApi();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { changes, message } = uiFlowProfile.update.getInitPayload(flow);
  const changeEntries = Object.entries(changes);
  const hasChanges = changeEntries.length > 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateProfile(changes);
      addResult(uiFlowProfile.update.complete());
    } catch (error) {
      addResult(
        uiFlowProfile.update.cancel(
          error instanceof Error
            ? `Canceled Due to Error: ${error.message}`
            : undefined,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowProfile.update.cancel("User discarded the changes"));
  };

  return (
    <FlowCard
      iconName="user"
      iconColorVar="--color-primary"
      iconBgClass="bg-blue-500/10"
      title="Update Profile"
      subtitle={message}
    >
      {hasChanges && (
        <FlowSection label="Proposed Changes">
          <View className="gap-1 rounded-lg bg-muted/30 p-3">
            {changeEntries.map(([key, value]) => (
              <View
                key={key}
                className="flex-row items-center justify-between py-1.5"
              >
                <Text className="text-sm text-muted-foreground">
                  {fieldLabels[key] || key}
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatValue(key, value)}
                </Text>
              </View>
            ))}
          </View>
        </FlowSection>
      )}

      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Discard"
        confirmLabel="Confirm"
        loading={loading}
      />
    </FlowCard>
  );
}
