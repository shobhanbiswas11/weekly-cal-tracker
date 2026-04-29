import { updateProfile } from "@/lib/api";
import { uiFlow, type UIFlow } from "@weekly-cal/core";
import { CheckCircle, Pencil, X } from "lucide-react";
import type { UIFlowRenderer } from "../ui-flow-registry";

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

type UpdateProfileFlow = Extract<UIFlow, { action: "UPDATE_PROFILE" }>;
export const UpdateProfile: UIFlowRenderer<"UPDATE_PROFILE"> = ({
  addResult,
  flow,
}) => {
  const { state } = flow.payload;

  // Show result state for confirmed, cancelled, or error
  if (state === "confirmed" || state === "cancelled" || state === "error") {
    const isSuccess = state === "confirmed";
    return (
      <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
        <div className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          {isSuccess ? (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                <CheckCircle className="size-4" />
              </span>
              <span className="text-sm font-medium text-green-600">
                {flow.payload.message}
              </span>
            </>
          ) : (
            <>
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <X className="size-4" />
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {flow.payload.message}
              </span>
            </>
          )}
        </div>
      </article>
    );
  }

  // State is "initiated" - show confirmation UI
  const { changes, message } = flow.payload as Extract<
    UpdateProfileFlow["payload"],
    { state: "initiated" }
  >;
  const changeEntries = Object.entries(changes);
  const hasChanges = changeEntries.length > 0;

  // Handle confirm - call API and add result
  const handleConfirm = async () => {
    try {
      await updateProfile(changes);
      addResult(
        uiFlow("UPDATE_PROFILE", {
          state: "confirmed",
          message: "Profile updated successfully",
        }) as UpdateProfileFlow,
      );
    } catch (error) {
      console.log(error);
      addResult(
        uiFlow("UPDATE_PROFILE", {
          state: "error",
          message:
            error instanceof Error ? error.message : "Failed to update profile",
        }) as UpdateProfileFlow,
      );
    }
  };

  // Handle cancel
  const handleCancel = () => {
    addResult(
      uiFlow("UPDATE_PROFILE", {
        state: "cancelled",
        message: "User discarded the changes",
      }) as UpdateProfileFlow,
    );
  };

  return (
    <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
      <div className="flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <Pencil className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-base font-semibold leading-tight">
              Update Profile
            </h2>
            <span className="text-xs text-muted-foreground">{message}</span>
          </div>
        </div>

        {/* Changes List */}
        {hasChanges && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Proposed Changes
              </span>
              <div className="space-y-1 rounded-lg bg-muted/30 p-3">
                {changeEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {fieldLabels[key] || key}
                    </span>
                    <span className="font-medium">
                      {formatValue(key, value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Confirm
          </button>
        </div>
      </div>
    </article>
  );
};
