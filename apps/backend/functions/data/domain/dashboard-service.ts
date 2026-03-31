// Dashboard service - Business logic for aggregating dashboard data

import type {
  DailySummary,
  DashboardResponse,
  FoodEntry,
  WeeklySummary,
} from "../../shared/types";
import * as entryRepo from "./entry-repository";
import * as profileRepo from "./profile-repository";

// =============================================================================
// Date Utilities
// =============================================================================

// Get ISO week ID (YYYY-Www) for a date
export const getISOWeekId = (date: Date): string => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  // January 4 is always in week 1
  const week1 = new Date(d.getFullYear(), 0, 4);
  // Calculate full weeks to Thursday
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
};

// Get start date (Monday) of an ISO week
export const getWeekStartDate = (weekId: string): Date => {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week format: ${weekId}. Expected YYYY-Www`);
  }

  const year = parseInt(match[1]);
  const week = parseInt(match[2]);

  // January 4 is always in week 1
  const jan4 = new Date(year, 0, 4);
  const jan4DayOfWeek = jan4.getDay() || 7; // Convert Sunday (0) to 7
  const firstMonday = new Date(jan4);
  firstMonday.setDate(jan4.getDate() - jan4DayOfWeek + 1);

  // Add weeks
  const result = new Date(firstMonday);
  result.setDate(firstMonday.getDate() + (week - 1) * 7);
  return result;
};

// Format date as YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Add days to a date
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// =============================================================================
// Summary Builders
// =============================================================================

// Create daily summary from entries
export const createDailySummary = (
  date: string,
  entries: FoodEntry[],
): DailySummary => ({
  date,
  entries,
  totalCalories: entries.reduce((sum, e) => sum + e.calories, 0),
  totalProtein: entries.reduce((sum, e) => sum + e.protein, 0),
  totalCarbs: entries.reduce((sum, e) => sum + e.carbs, 0),
  totalFat: entries.reduce((sum, e) => sum + e.fat, 0),
});

// Group entries by date
const groupEntriesByDate = (entries: FoodEntry[]): Map<string, FoodEntry[]> => {
  const grouped = new Map<string, FoodEntry[]>();
  for (const entry of entries) {
    const existing = grouped.get(entry.date) || [];
    existing.push(entry);
    grouped.set(entry.date, existing);
  }
  return grouped;
};

// Create weekly summary from entries
export const createWeeklySummary = (
  weekId: string,
  startDate: Date,
  entries: FoodEntry[],
): WeeklySummary => {
  const groupedByDate = groupEntriesByDate(entries);
  const days: DailySummary[] = [];

  // Create summary for each day of the week
  for (let i = 0; i < 7; i++) {
    const date = formatDate(addDays(startDate, i));
    const dayEntries = groupedByDate.get(date) || [];
    days.push(createDailySummary(date, dayEntries));
  }

  const endDate = formatDate(addDays(startDate, 6));

  // Calculate weekly totals
  const weeklyTotalCalories = days.reduce((s, d) => s + d.totalCalories, 0);
  const weeklyTotalProtein = days.reduce((s, d) => s + d.totalProtein, 0);
  const weeklyTotalCarbs = days.reduce((s, d) => s + d.totalCarbs, 0);
  const weeklyTotalFat = days.reduce((s, d) => s + d.totalFat, 0);

  return {
    weekId,
    startDate: formatDate(startDate),
    endDate,
    days,
    weeklyTotalCalories,
    weeklyTotalProtein,
    weeklyTotalCarbs,
    weeklyTotalFat,
    averageDailyCalories: Math.round(weeklyTotalCalories / 7),
  };
};

// =============================================================================
// Service Functions
// =============================================================================

export const getDashboard = async (
  userId: string,
): Promise<DashboardResponse> => {
  // Calculate current week boundaries
  const today = new Date();
  const currentWeekId = getISOWeekId(today);
  const weekStart = getWeekStartDate(currentWeekId);
  const weekEnd = addDays(weekStart, 6);

  // Fetch profile and entries in parallel
  const [profile, entries] = await Promise.all([
    profileRepo.getProfile(userId),
    entryRepo.getEntriesByDateRange(
      userId,
      formatDate(weekStart),
      formatDate(weekEnd),
    ),
  ]);

  // Build weekly summary
  const currentWeek = createWeeklySummary(currentWeekId, weekStart, entries);

  return {
    profile,
    currentWeek,
  };
};

export const getWeeklySummary = async (
  userId: string,
  weekId: string,
): Promise<WeeklySummary> => {
  const weekStart = getWeekStartDate(weekId);
  const weekEnd = addDays(weekStart, 6);

  const entries = await entryRepo.getEntriesByDateRange(
    userId,
    formatDate(weekStart),
    formatDate(weekEnd),
  );

  return createWeeklySummary(weekId, weekStart, entries);
};
