import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useInvalidateDashboard } from "@/hooks/dashboard";
import { createProfile } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import type { CreateProfile } from "../types";

interface ProfileSetupPreviewProps {
  profile: CreateProfile;
  onSaved?: () => void;
  onCanceled?: () => void;
}

const activityLevelLabels: Record<string, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Light (exercise 1-3 days/week)",
  moderate: "Moderate (exercise 3-5 days/week)",
  active: "Active (hard exercise 6-7 days/week)",
  very_active: "Very Active (intense exercise & physical job)",
};

const primaryGoalLabels: Record<string, string> = {
  lose_weight: "Lose Weight",
  maintain_weight: "Maintain Weight",
  gain_muscle: "Gain Muscle",
  improve_health: "Improve Health",
};

function formatNumber(num: number): string {
  return Math.round(num).toLocaleString();
}

function CalorieTargetsSection({ profile }: { profile: CreateProfile }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Daily Targets</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">Calories:</span>
        <span className="font-medium">
          {formatNumber(profile.dailyCalorieTarget)} kcal
        </span>
        <span className="text-muted-foreground">Protein:</span>
        <span>{formatNumber(profile.proteinTarget)}g</span>
        <span className="text-muted-foreground">Carbs:</span>
        <span>{formatNumber(profile.carbsTarget)}g</span>
        <span className="text-muted-foreground">Fat:</span>
        <span>{formatNumber(profile.fatTarget)}g</span>
      </div>
    </div>
  );
}

function MetabolismSection({ profile }: { profile: CreateProfile }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Metabolism</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground">Activity Level:</span>
        <span>
          {activityLevelLabels[profile.activityLevel] || profile.activityLevel}
        </span>
        <span className="text-muted-foreground">BMR:</span>
        <span>{formatNumber(profile.bmr)} kcal/day</span>
        <span className="text-muted-foreground">TDEE:</span>
        <span>{formatNumber(profile.tdee)} kcal/day</span>
        {profile.dailyCalorieAdjustment !== 0 && (
          <>
            <span className="text-muted-foreground">Daily Adjustment:</span>
            <span
              className={
                profile.dailyCalorieAdjustment < 0
                  ? "text-orange-600"
                  : "text-success"
              }
            >
              {profile.dailyCalorieAdjustment > 0 ? "+" : ""}
              {formatNumber(profile.dailyCalorieAdjustment)} kcal
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function GoalProjectionSection({ profile }: { profile: CreateProfile }) {
  if (
    !profile.targetWeight &&
    !profile.estimatedWeeklyWeightChange &&
    !profile.estimatedWeeksToGoal
  ) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">Goal Projection</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {profile.targetWeight && (
          <>
            <span className="text-muted-foreground">Target Weight:</span>
            <span>{profile.targetWeight} kg</span>
          </>
        )}
        {profile.estimatedWeeklyWeightChange && (
          <>
            <span className="text-muted-foreground">Weekly Change:</span>
            <span>
              {profile.estimatedWeeklyWeightChange > 0 ? "+" : ""}
              {profile.estimatedWeeklyWeightChange.toFixed(2)} kg
            </span>
          </>
        )}
        {profile.estimatedWeeksToGoal && (
          <>
            <span className="text-muted-foreground">Est. Time to Goal:</span>
            <span>{Math.round(profile.estimatedWeeksToGoal)} weeks</span>
          </>
        )}
      </div>
    </div>
  );
}

export function ProfileSetupPreview({
  profile,
  onSaved,
  onCanceled,
}: ProfileSetupPreviewProps) {
  const invalidateDashboard = useInvalidateDashboard();

  const mutation = useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      invalidateDashboard();
      // Notify parent that profile was saved (persists in message state)
      onSaved?.();
    },
  });

  const handleConfirm = () => {
    mutation.mutate(profile);
  };

  const handleCancel = () => {
    // Notify parent that profile setup was canceled (persists in message state)
    onCanceled?.();
  };

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Confirm Profile</CardTitle>
        <CardDescription>
          Please review your profile and nutrition targets before saving.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Profile Information */}
        <div className="space-y-1 text-sm">
          <h4 className="font-medium text-sm mb-2">Personal Information</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-muted-foreground">Name:</span>
            <span className="font-medium">{profile.name}</span>
            <span className="text-muted-foreground">Date of Birth:</span>
            <span className="font-medium">{profile.dateOfBirth}</span>
            <span className="text-muted-foreground">Biological Sex:</span>
            <span className="font-medium capitalize">
              {profile.biologicalSex}
            </span>
            <span className="text-muted-foreground">Height:</span>
            <span className="font-medium">{profile.height}</span>
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium">{profile.weight}</span>
            <span className="text-muted-foreground">Primary Goal:</span>
            <span className="font-medium">
              {primaryGoalLabels[profile.primaryGoal] || profile.primaryGoal}
            </span>
            {profile.additionalNotes && (
              <>
                <span className="text-muted-foreground">Notes:</span>
                <span className="font-medium">{profile.additionalNotes}</span>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Calculated Nutrition Targets */}
        <CalorieTargetsSection profile={profile} />

        <Separator />

        <MetabolismSection profile={profile} />

        <GoalProjectionSection profile={profile} />

        {/* Weekly Summary */}
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Weekly Calorie Budget:
            </span>
            <span className="font-semibold text-base">
              {formatNumber(profile.weeklyCalorieTarget)} kcal
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        {mutation.isError && (
          <p className="text-sm text-destructive">
            {mutation.error instanceof Error
              ? mutation.error.message
              : "An error occurred"}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Confirm"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
