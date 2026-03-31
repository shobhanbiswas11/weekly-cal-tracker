// Data hooks for user profile using TanStack Query
// Reads profile from /dashboard endpoint, writes via /profile

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  updateProfile as apiUpdateProfile,
  fetchDashboard,
} from "../../../lib/api";
import type { ProfileUpdate, UserProfile } from "../types";
import { isProfileComplete } from "../types";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get the dashboard data (profile + current week)
 * This is the primary data fetch for app init
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get the current user's profile
 * Extracts profile from dashboard query
 */
export function useProfile() {
  const dashboard = useDashboard();

  return {
    data: dashboard.data?.profile as UserProfile | undefined,
    exists:
      dashboard.data?.profile !== null && dashboard.data?.profile !== undefined,
    isLoading: dashboard.isLoading,
    error: dashboard.error,
    refetch: dashboard.refetch,
  };
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Update the user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ProfileUpdate) => apiUpdateProfile(updates),
    onSuccess: (data) => {
      // Update the dashboard cache with the new profile
      queryClient.setQueryData(dashboardKeys.all, (old: any) => ({
        ...old,
        profile: data.profile,
      }));
    },
  });
}

/**
 * Create a new profile (for onboarding)
 * Uses the same update endpoint with initial data
 */
export function useCreateProfile() {
  return useUpdateProfile();
}

// =============================================================================
// Derived Hooks
// =============================================================================

/**
 * Check if the profile has all required fields for AI calculations
 */
export function useProfileCompleteness(): {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
} {
  const { data: profile } = useProfile();

  return useMemo(() => {
    if (!profile) {
      return {
        isComplete: false,
        missingFields: [
          "dateOfBirth",
          "biologicalSex",
          "height",
          "currentWeight",
          "activityLevel",
          "primaryGoal",
        ],
        completionPercentage: 0,
      };
    }

    const requiredFields = [
      "dateOfBirth",
      "biologicalSex",
      "height",
      "currentWeight",
      "activityLevel",
      "primaryGoal",
    ] as const;

    const missingFields = requiredFields.filter(
      (field) => profile[field] === undefined || profile[field] === null,
    );

    const totalFields = requiredFields.length;
    const completedFields = totalFields - missingFields.length;
    const completionPercentage = Math.round(
      (completedFields / totalFields) * 100,
    );

    return {
      isComplete: isProfileComplete(profile),
      missingFields: missingFields as string[],
      completionPercentage,
    };
  }, [profile]);
}

/**
 * Get profile data formatted for LLM context
 */
export function useProfileContext(): {
  context: string | null;
  isReady: boolean;
} {
  const { data: profile, isLoading } = useProfile();

  const context = useMemo(() => {
    if (!profile) return null;

    // Build a natural language context string for the LLM
    const parts: string[] = [];

    if (profile.name) {
      parts.push(`User's name is ${profile.name}.`);
    }

    if (profile.dateOfBirth) {
      const age = calculateAge(profile.dateOfBirth);
      parts.push(`Age: ${age} years old.`);
    }

    if (profile.biologicalSex) {
      parts.push(`Biological sex: ${profile.biologicalSex}.`);
    }

    if (profile.height && profile.currentWeight) {
      const unit = profile.unitSystem === "metric" ? "cm" : "inches";
      const weightUnit = profile.unitSystem === "metric" ? "kg" : "lbs";
      parts.push(
        `Height: ${profile.height} ${unit}, Current weight: ${profile.currentWeight} ${weightUnit}.`,
      );
    }

    if (profile.primaryGoal) {
      parts.push(`Primary goal: ${profile.primaryGoal.replace(/_/g, " ")}.`);
    }

    if (profile.targetWeight) {
      const weightUnit = profile.unitSystem === "metric" ? "kg" : "lbs";
      parts.push(`Target weight: ${profile.targetWeight} ${weightUnit}.`);
    }

    if (profile.activityLevel) {
      parts.push(
        `Activity level: ${profile.activityLevel.replace(/_/g, " ")}.`,
      );
    }

    if (profile.exerciseTypes && profile.exerciseTypes.length > 0) {
      parts.push(
        `Exercise types: ${profile.exerciseTypes.map((t) => t.replace(/_/g, " ")).join(", ")}.`,
      );
    }

    if (profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0) {
      parts.push(
        `Dietary restrictions: ${profile.dietaryRestrictions.map((r) => r.replace(/_/g, " ")).join(", ")}.`,
      );
    }

    if (profile.allergies && profile.allergies.length > 0) {
      parts.push(`Food allergies: ${profile.allergies.join(", ")}.`);
    }

    if (profile.foodIntolerances && profile.foodIntolerances.length > 0) {
      parts.push(
        `Food intolerances: ${profile.foodIntolerances.map((i) => i.replace(/_/g, " ")).join(", ")}.`,
      );
    }

    if (profile.medicalConditions && profile.medicalConditions.length > 0) {
      parts.push(
        `Medical conditions: ${profile.medicalConditions.join(", ")}.`,
      );
    }

    if (profile.calculatedTargets) {
      const t = profile.calculatedTargets;
      parts.push(
        `Current targets: ${t.dailyCalorieTarget} kcal/day, ${t.proteinTarget}g protein, ${t.carbsTarget}g carbs, ${t.fatTarget}g fat.`,
      );
    }

    parts.push(`Unit system: ${profile.unitSystem}.`);

    return parts.join(" ");
  }, [profile]);

  return {
    context,
    isReady: !isLoading && context !== null,
  };
}

// Helper function
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
