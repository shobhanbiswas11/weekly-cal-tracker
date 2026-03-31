// Profile services - pure business logic functions
// No React dependencies, can be used anywhere

import type { ProfileData } from "../../lib/api";
import type { UserProfile } from "./types";
import { isProfileComplete } from "./types";

type ProfileLike = UserProfile | ProfileData | null | undefined;

// =============================================================================
// Profile Validation & Completeness
// =============================================================================

/**
 * Check if a profile exists (not null/undefined)
 */
export function profileExists(profile: ProfileLike): boolean {
  return profile !== null && profile !== undefined;
}

/**
 * Calculate profile completeness for onboarding
 */
export function getProfileCompleteness(profile: ProfileLike): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const requiredFields = [
    "dateOfBirth",
    "biologicalSex",
    "height",
    "currentWeight",
    "activityLevel",
    "primaryGoal",
  ] as const;

  if (!profile) {
    return {
      isComplete: false,
      missingFields: [...requiredFields],
      completionPercentage: 0,
    };
  }

  // Handle both UserProfile (currentWeight) and ProfileData (weight)
  const normalizedProfile = {
    ...profile,
    currentWeight:
      (profile as UserProfile).currentWeight ?? (profile as ProfileData).weight,
  };

  const missingFields = requiredFields.filter((field) => {
    const value = normalizedProfile[field as keyof typeof normalizedProfile];
    return value === undefined || value === null;
  });

  const totalFields = requiredFields.length;
  const completedFields = totalFields - missingFields.length;
  const completionPercentage = Math.round(
    (completedFields / totalFields) * 100,
  );

  // Only check isProfileComplete if it's a UserProfile with all required fields
  const isComplete =
    missingFields.length === 0 &&
    ("id" in profile ? isProfileComplete(profile as UserProfile) : true);

  return {
    isComplete,
    missingFields: missingFields as string[],
    completionPercentage,
  };
}

/**
 * Build a natural language context string for LLM consumption
 */
export function buildProfileContext(profile: ProfileLike): string | null {
  if (!profile) return null;

  const parts: string[] = [];

  const dob = (profile as UserProfile).dateOfBirth;
  if (dob) {
    const age = Math.floor(
      (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    parts.push(`${age} years old`);
  } else if ((profile as ProfileData).age) {
    parts.push(`${(profile as ProfileData).age} years old`);
  }

  if ((profile as UserProfile).biologicalSex) {
    parts.push((profile as UserProfile).biologicalSex!.toLowerCase());
  }

  const height = profile.height ?? (profile as ProfileData).height;
  if (height) {
    parts.push(`${height}cm tall`);
  }

  const weight =
    (profile as UserProfile).currentWeight ?? (profile as ProfileData).weight;
  if (weight) {
    parts.push(`weighs ${weight}kg`);
  }

  if ((profile as UserProfile).activityLevel) {
    parts.push(
      `${(profile as UserProfile).activityLevel!.toLowerCase().replace("_", " ")} activity level`,
    );
  }

  if ((profile as UserProfile).primaryGoal) {
    parts.push(
      `goal: ${(profile as UserProfile).primaryGoal!.toLowerCase().replace("_", " ")}`,
    );
  }

  const calorieGoal =
    (profile as ProfileData).calorieGoal ??
    (profile as UserProfile).calculatedTargets?.dailyCalorieTarget;
  if (calorieGoal) {
    parts.push(`daily calorie target: ${calorieGoal} kcal`);
  }

  return parts.length > 0 ? `User profile: ${parts.join(", ")}` : null;
}
