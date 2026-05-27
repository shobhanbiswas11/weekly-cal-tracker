import type { ActivityEntry, MealEntry, Profile } from "../entities";

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ResponseSummary {
  profile: Profile | null;
  weekId: string; // Format: YYYY-Www
  mealEntries: MealEntry[];
  activityEntries: ActivityEntry[];
}

export interface ResponseWeeklySummary {
  weekId: string; // Format: YYYY-Www
  mealEntries: MealEntry[];
}

export interface ResponseEntriesByDate {
  entries: MealEntry[];
}

export interface ResponseCreateEntry {
  message: string;
}
