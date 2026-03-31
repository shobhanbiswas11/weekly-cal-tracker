// Mock data for profile development
// Replace with actual API calls when backend is ready

import type { UserProfile } from "../types";

/**
 * Default empty profile for new users
 */
export function createEmptyProfile(id: string): UserProfile {
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    unitSystem: "metric",
  };
}

/**
 * Example complete profile for testing/development
 */
export const MOCK_COMPLETE_PROFILE: UserProfile = {
  id: "user_mock_123",
  createdAt: "2026-01-15T10:00:00.000Z",
  updatedAt: "2026-03-30T14:30:00.000Z",

  // Demographics
  name: "Alex",
  dateOfBirth: "1990-05-15",
  biologicalSex: "male",
  height: 178, // cm
  currentWeight: 82, // kg

  // Body Composition
  bodyFatPercentage: 22,

  // Goals
  primaryGoal: "lose_weight",
  targetWeight: 75,
  weeklyWeightChangeTarget: -0.5, // lose 0.5 kg per week

  // Activity
  activityLevel: "moderately_active",
  exerciseFrequency: 4,
  exerciseTypes: ["strength_training", "running", "yoga"],
  stepGoal: 10000,
  occupation: "desk_job",

  // Dietary
  dietaryRestrictions: [],
  allergies: ["peanuts"],
  foodIntolerances: ["lactose"],
  cuisinePreferences: ["indian", "mediterranean", "japanese"],
  mealFrequency: 3,

  // Health
  medicalConditions: [],
  medications: [],
  pregnancyStatus: "not_applicable",

  // Preferences
  unitSystem: "metric",

  // AI-Calculated
  calculatedTargets: {
    dailyCalorieTarget: 2200,
    proteinTarget: 165, // ~2g per kg target weight
    carbsTarget: 220,
    fatTarget: 73,
    fiberTarget: 30,
    waterTarget: 2500,
    lastCalculatedAt: "2026-03-30T14:30:00.000Z",
    calculationNotes:
      "Based on moderate deficit of ~500 kcal/day for 0.5 kg/week loss. High protein to preserve muscle during weight loss.",
  },
};

/**
 * Example incomplete profile (new user onboarding)
 */
export const MOCK_INCOMPLETE_PROFILE: UserProfile = {
  id: "user_mock_456",
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",

  name: "Jordan",
  dateOfBirth: "1995-08-20",
  biologicalSex: "female",
  height: 165,
  currentWeight: 68,

  unitSystem: "metric",
  // Missing: goals, activity level, dietary preferences, etc.
};

// Storage key for localStorage
const PROFILE_STORAGE_KEY = "user_profile";

/**
 * Get profile from localStorage (or return mock for development)
 */
export function getStoredProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as UserProfile;
    }
    return null;
  } catch {
    console.error("Failed to parse stored profile");
    return null;
  }
}

/**
 * Save profile to localStorage
 */
export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
}

/**
 * Clear profile from localStorage
 */
export function clearStoredProfile(): void {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}
