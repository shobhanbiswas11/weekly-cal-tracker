import type { ActivityEntry, MealEntry, Profile } from "@weekly-cal/core";

// =============================================================================
// Profiles
// =============================================================================

export const TEST_USER_ID = "user_test_123";

export const baseProfile: Profile = {
  id: TEST_USER_ID,
  name: "Test User",
  dateOfBirth: "1990-01-01",
  biologicalSex: "Male",
  height: 175,
  weight: 80,
  activityLevel: "Moderately Active",
  goal: "Maintain Healthy Lifestyle",
  preferences: { heightUnit: "cm", weightUnit: "kg" },
  chatMessageCount: 0,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return { ...baseProfile, ...overrides };
}

// =============================================================================
// Meal Entries
// =============================================================================

export function makeMealEntry(overrides: Partial<MealEntry> = {}): MealEntry {
  return {
    id: "meal-1",
    date: "2025-01-06",
    name: "Test Meal",
    calories: 500,
    protein: 30,
    carbs: 50,
    fats: 20,
    fiber: 5,
    sugar: 10,
    sodium: 400,
    note: null,
    foodItems: null,
    createdAt: "2025-01-06T12:00:00Z",
    updatedAt: "2025-01-06T12:00:00Z",
    ...overrides,
  };
}

// =============================================================================
// Activity Entries
// =============================================================================

export function makeActivityEntry(
  overrides: Partial<ActivityEntry> = {},
): ActivityEntry {
  return {
    id: "activity-1",
    date: "2025-01-06",
    name: "Running",
    caloriesBurned: 300,
    note: null,
    createdAt: "2025-01-06T08:00:00Z",
    updatedAt: "2025-01-06T08:00:00Z",
    ...overrides,
  };
}

// =============================================================================
// Test Environment
// =============================================================================

export const testEnv: Record<string, string> = {
  TABLE_NAME: "test-table",
  JWT_ISSUER: "https://test.clerk.accounts.dev",
  OPENAI_API_KEY: "sk-test-key",
  CLERK_SECRET_KEY: "sk_test_clerk_key",
  REVENUECAT_SECRET_KEY: "rc_test_key",
};
