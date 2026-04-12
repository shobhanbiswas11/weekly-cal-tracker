import z from "zod";
import { schemaCalorieEntry } from "./calorie-entry.view";
import { schemaMacroTotals } from "./macros";

// =============================================================================
// Summary Aggregate Schemas
// =============================================================================

/**
 * Daily summary aggregating all meals and totals for a single day
 */
export const schemaDailySummary = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format"),
  entries: z.array(schemaCalorieEntry),
  totals: schemaMacroTotals,
  calorieGoal: z.number(),
  caloriesRemaining: z.number(),
});

export type DailySummary = z.infer<typeof schemaDailySummary>;

/**
 * Weekly summary aggregating all days and totals for a week
 */
export const schemaWeeklySummary = z.object({
  weekId: z.string().describe("Week ID in YYYY-Www format (e.g., 2026-W15)"),
  startDate: z.string().describe("Monday of the week in YYYY-MM-DD format"),
  endDate: z.string().describe("Sunday of the week in YYYY-MM-DD format"),
  days: z.array(schemaDailySummary),
  weeklyTotals: schemaMacroTotals,
  weeklyCalorieGoal: z.number(),
  weeklyCaloriesRemaining: z.number(),
  averageDailyCalories: z.number(),
});

export type WeeklySummary = z.infer<typeof schemaWeeklySummary>;
