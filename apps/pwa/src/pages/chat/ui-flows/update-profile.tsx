import { isCompleteOrCancelledUIFlow, uiFlowProfile } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { Pencil } from "lucide-react";
import { useState } from "react";
import type { UIFlowRendererProps } from "../types";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";

// Human-readable labels for profile fields
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
    if (key === "targetWeight") {
      return `${value} kg`;
    }
    return value.toString();
  }
  return String(value);
}

export const UpdateProfile = ({ addResult, flow }: UIFlowRendererProps) => {
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useApi();

  // Show result state for completed or cancelled
  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { changes, message } = uiFlowProfile.update.getInitPayload(flow);
  const changeEntries = Object.entries(changes);
  const hasChanges = changeEntries.length > 0;

  // Handle confirm - call API and add result
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateProfile(changes);
      addResult(uiFlowProfile.update.complete());
    } catch (error) {
      console.log(error);
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

  // Handle cancel
  const handleCancel = () => {
    addResult(uiFlowProfile.update.cancel("User discarded the changes"));
  };

  return (
    <FlowCard
      icon={Pencil}
      iconColorClass="bg-blue-500/10 text-blue-600"
      title="Update Profile"
      subtitle={message}
    >
      {/* Changes List */}
      {hasChanges && (
        <FlowSection label="Proposed Changes">
          <div className="space-y-1 rounded-lg bg-muted/30 p-3">
            {changeEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-1.5 text-sm"
              >
                <span className="text-muted-foreground">
                  {fieldLabels[key] || key}
                </span>
                <span className="font-medium">{formatValue(key, value)}</span>
              </div>
            ))}
          </div>
        </FlowSection>
      )}

      {/* Action Buttons */}
      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Discard"
        confirmLabel="Confirm"
        loading={loading}
      />
    </FlowCard>
  );
};
