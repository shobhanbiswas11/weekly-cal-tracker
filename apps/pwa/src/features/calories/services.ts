// Calorie tracking services - pure business logic functions
// No React dependencies, can be used anywhere

import { format } from "date-fns";
import type { EntryData } from "../../lib/api";
import type {
  CalorieEntry,
  DailySummary,
  MacroTotals,
  WeeklySummary,
} from "./types";
import {
  addDays,
  formatDateToISO,
  getAdjacentWeek,
  getISOWeek,
  getWeekRange,
  parseLocalDate,
} from "./utils";

// =============================================================================
// Constants
// =============================================================================

export const DEFAULT_CALORIE_GOAL = 2000;

// =============================================================================
// Data Transformation Functions
// =============================================================================

/**
 * Convert API EntryData to CalorieEntry domain type
 */
export function toCalorieEntry(entry: EntryData): CalorieEntry {
  return {
    id: entry.id,
    date: entry.date,
    time: entry.timestamp
      ? format(new Date(entry.timestamp), "HH:mm")
      : "12:00",
    name: entry.name || "Unknown",
    calories: entry.calories || 0,
    protein: entry.protein || 0,
    carbs: entry.carbs || 0,
    fat: entry.fats || 0,
  };
}

/**
 * Calculate macro totals from a list of entries
 */
export function calculateTotals(entries: CalorieEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/**
 * Transform flat API entries into a structured WeeklySummary
 */
export function transformToWeeklySummary(
  weekId: string,
  entries: EntryData[],
  dailyCalorieGoal: number = DEFAULT_CALORIE_GOAL,
): WeeklySummary {
  const { start, end } = getWeekRange(weekId);
  const calorieEntries = entries.map(toCalorieEntry);

  // Group entries by date
  const entriesByDate = new Map<string, CalorieEntry[]>();
  for (const entry of calorieEntries) {
    const existing = entriesByDate.get(entry.date) || [];
    entriesByDate.set(entry.date, [...existing, entry]);
  }

  // Generate all 7 days of the week
  const days: DailySummary[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const dateStr = formatDateToISO(date);
    const dayEntries = entriesByDate.get(dateStr) || [];
    const totals = calculateTotals(dayEntries);

    days.push({
      date: dateStr,
      entries: dayEntries,
      totals,
      calorieGoal: dailyCalorieGoal,
      caloriesRemaining: dailyCalorieGoal - totals.calories,
    });
  }

  const weeklyTotals = calculateTotals(calorieEntries);
  const weeklyCalorieGoal = dailyCalorieGoal * 7;
  const daysWithEntries = days.filter((d) => d.entries.length > 0).length;

  return {
    weekId,
    startDate: formatDateToISO(start),
    endDate: formatDateToISO(end),
    days,
    weeklyTotals,
    weeklyCalorieGoal,
    weeklyCaloriesRemaining: weeklyCalorieGoal - weeklyTotals.calories,
    averageDailyCalories:
      daysWithEntries > 0 ? weeklyTotals.calories / daysWithEntries : 0,
  };
}

/**
 * Extract a single day's summary from a weekly summary
 */
export function extractDailySummary(
  weekSummary: WeeklySummary,
  date: string,
): DailySummary | undefined {
  return weekSummary.days.find((d) => d.date === date);
}

// =============================================================================
// Week ID Utilities
// =============================================================================

/**
 * Get ISO week ID (YYYY-Www) for a given date string
 */
export function getWeekIdForDate(dateStr: string): string {
  return getISOWeek(parseLocalDate(dateStr));
}

/**
 * Get the previous week's ID
 */
export function getPreviousWeek(weekId: string): string {
  return getAdjacentWeek(weekId, "prev");
}
