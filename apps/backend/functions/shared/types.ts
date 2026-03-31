// Shared types for Lambda functions

// =============================================================================
// DynamoDB Item Types (Single Table Design)
// =============================================================================

// Base DynamoDB item with PK/SK
export interface DynamoDBItem {
  PK: string; // USER#<userId>
  SK: string; // Type-specific sort key
}

// Profile item stored in DynamoDB
export interface ProfileItem extends DynamoDBItem {
  SK: "PROFILE";
  data: Record<string, unknown>; // Flexible profile data - frontend owns types
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Food entry item stored in DynamoDB
export interface FoodEntryItem extends DynamoDBItem {
  SK: string; // FOOD_ENTRY#<YYYY-MM-DD>#<uuid>
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO 8601
  rawInput?: string;
}

// =============================================================================
// API Types (what frontend sends/receives)
// =============================================================================

// Food entry (API representation)
export interface FoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO 8601
  rawInput?: string;
}

// Create food entry request
export interface CreateFoodEntryRequest {
  date?: string; // Optional, defaults to today
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Update food entry request (partial)
export interface UpdateFoodEntryRequest {
  name?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

// Profile (API representation - flexible record)
export type Profile = Record<string, unknown>;

// Daily summary
export interface DailySummary {
  date: string;
  entries: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Weekly summary
export interface WeeklySummary {
  weekId: string; // ISO week: 2026-W13
  startDate: string;
  endDate: string;
  days: DailySummary[];
  weeklyTotalCalories: number;
  weeklyTotalProtein: number;
  weeklyTotalCarbs: number;
  weeklyTotalFat: number;
  averageDailyCalories: number;
}

// Dashboard response (app init)
export interface DashboardResponse {
  profile: Profile | null;
  currentWeek: WeeklySummary;
}

// =============================================================================
// Legacy types (for backwards compatibility during migration)
// =============================================================================

/** @deprecated Use FoodEntry instead */
export type CalorieEntry = FoodEntry;

/** @deprecated Use FoodEntryItem instead */
export type DynamoDBEntry = FoodEntryItem;
