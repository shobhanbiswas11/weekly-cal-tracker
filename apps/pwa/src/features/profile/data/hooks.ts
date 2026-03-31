// Data hooks for user profile
// Currently uses localStorage, same interface as future API hooks

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProfileUpdate, UserProfile } from "../types";
import {
  createEmptyProfile,
  getStoredProfile,
  MOCK_COMPLETE_PROFILE,
  saveProfile,
} from "./mock-data";

interface UseDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

interface UseProfileResult extends UseDataResult<UserProfile> {
  /** Whether the profile exists (user has started onboarding) */
  exists: boolean;
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: Error | null;
}

// Use mock data in development, localStorage in production
const USE_MOCK_DATA = false; // Set to true to always use mock profile

/**
 * Get the current user's profile
 */
export function useProfile(): UseProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate async load
    const loadProfile = () => {
      if (USE_MOCK_DATA) {
        setProfile(MOCK_COMPLETE_PROFILE);
      } else {
        const stored = getStoredProfile();
        setProfile(stored);
      }
      setIsLoading(false);
    };

    // Small delay to simulate network request
    const timer = setTimeout(loadProfile, 100);
    return () => clearTimeout(timer);
  }, []);

  return {
    data: profile ?? undefined,
    exists: profile !== null,
    isLoading,
    error: null,
  };
}

/**
 * Update the user's profile
 */
export function useUpdateProfile(): UseMutationResult<
  UserProfile,
  ProfileUpdate
> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (updates: ProfileUpdate): Promise<UserProfile> => {
      setIsLoading(true);
      setError(null);

      try {
        // Get existing profile or create new one
        const existing = getStoredProfile();
        const now = new Date().toISOString();

        const updated: UserProfile = existing
          ? {
              ...existing,
              ...updates,
              updatedAt: now,
            }
          : {
              ...createEmptyProfile(crypto.randomUUID()),
              ...updates,
              updatedAt: now,
            };

        // Save to localStorage
        saveProfile(updated);

        setIsLoading(false);
        return updated;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update profile");
        setError(error);
        setIsLoading(false);
        throw error;
      }
    },
    [],
  );

  const mutate = useCallback(
    (updates: ProfileUpdate) => {
      mutateAsync(updates).catch(() => {
        // Error is already set in state
      });
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
  };
}

/**
 * Create a new profile (for onboarding)
 */
export function useCreateProfile(): UseMutationResult<
  UserProfile,
  Partial<UserProfile>
> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (initialData: Partial<UserProfile>): Promise<UserProfile> => {
      setIsLoading(true);
      setError(null);

      try {
        const now = new Date().toISOString();
        const profile: UserProfile = {
          ...createEmptyProfile(crypto.randomUUID()),
          ...initialData,
          createdAt: now,
          updatedAt: now,
        };

        saveProfile(profile);
        setIsLoading(false);
        return profile;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create profile");
        setError(error);
        setIsLoading(false);
        throw error;
      }
    },
    [],
  );

  const mutate = useCallback(
    (initialData: Partial<UserProfile>) => {
      mutateAsync(initialData).catch(() => {
        // Error is already set in state
      });
    },
    [mutateAsync],
  );

  return {
    mutate,
    mutateAsync,
    isLoading,
    error,
  };
}

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

    const filledCount = requiredFields.length - missingFields.length;
    const completionPercentage = Math.round(
      (filledCount / requiredFields.length) * 100,
    );

    return {
      isComplete: missingFields.length === 0,
      missingFields: missingFields as unknown as string[],
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
