import { z } from "zod";
import {
  schemaCreateMealEntry,
  schemaUpdateMealEntry,
} from "../schemas/dtos/create-meal-entry.dto";
import { schemaMealEntryEntity } from "../schemas/entities/meal-entry.entity";
import { defineTool } from "./types";

// =============================================================================
// Query Schemas
// =============================================================================

export const schemaGetEntriesByDate = z.object({
  date: z.string().describe("Date in ISO format (YYYY-MM-DD)"),
});

export const schemaGetEntriesByDateRange = z.object({
  startDate: z.string().describe("Start date in ISO format (YYYY-MM-DD)"),
  endDate: z
    .string()
    .optional()
    .describe("End date (YYYY-MM-DD). Defaults to startDate."),
});

export const schemaGetEntryById = z.object({
  id: z.string().describe("The meal entry ID"),
});

export const schemaUpdateMealEntryInput = schemaUpdateMealEntry.extend({
  id: z.string().describe("The meal entry ID to update"),
});

export const schemaDeleteMealEntry = z.object({
  id: z.string().describe("The meal entry ID to delete"),
});

// =============================================================================
// Output Schemas
// =============================================================================

const schemaEntrySummary = z.object({
  entries: z.array(schemaMealEntryEntity),
  totalCalories: z.number(),
  totalProtein: z.number(),
  totalCarbs: z.number(),
  totalFats: z.number(),
});

export const schemaGetEntriesByDateOutput = schemaEntrySummary.extend({
  date: z.string(),
});

export const schemaGetEntriesByDateRangeOutput = schemaEntrySummary.extend({
  startDate: z.string(),
  endDate: z.string(),
});

export const schemaGetEntryByIdOutput = z.union([
  schemaMealEntryEntity,
  z.object({ error: z.string() }),
]);

export const schemaCreateMealEntryOutput = z.object({
  success: z.literal(true),
  message: z.string(),
  entry: schemaMealEntryEntity,
});

export const schemaUpdateMealEntryOutput = z.object({
  success: z.literal(true),
  message: z.string(),
  entry: schemaMealEntryEntity,
});

export const schemaDeleteMealEntryOutput = z.union([
  z.object({
    success: z.literal(true),
    message: z.string(),
    deletedEntry: schemaMealEntryEntity,
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

// =============================================================================
// Tool Definitions
// =============================================================================

export const toolGetEntriesByDate = defineTool({
  name: "get_entries_by_date",
  title: "Get Entries by Date",
  description:
    "Get meal entries for a SINGLE specific date only. For multiple days, a week, or any date range, use get_entries_by_date_range instead.",
  inputSchema: schemaGetEntriesByDate,
  outputSchema: schemaGetEntriesByDateOutput,
  approval: { require: false },
});

export const toolGetEntriesByDateRange = defineTool({
  name: "get_entries_by_date_range",
  title: "Get Entries by Date Range",
  description:
    "Get meal entries for multiple days at once. ALWAYS use this for: 'this week', 'last week', 'past X days', 'this month', or any multi-day query. More efficient than calling get_entries_by_date multiple times.",
  inputSchema: schemaGetEntriesByDateRange,
  outputSchema: schemaGetEntriesByDateRangeOutput,
  approval: { require: false },
});

export const toolGetEntryById = defineTool({
  name: "get_entry_by_id",
  title: "Get Entry by ID",
  description: "Get a specific meal entry by ID",
  inputSchema: schemaGetEntryById,
  outputSchema: schemaGetEntryByIdOutput,
  approval: { require: false },
});

export const toolCreateMealEntry = defineTool({
  name: "create_meal_entry",
  title: "Log Meal",
  description: "Log a meal with estimated nutrition values",
  inputSchema: schemaCreateMealEntry,
  outputSchema: schemaCreateMealEntryOutput,
  approval: { require: true, confirmLabel: "Log it", cancelLabel: "Cancel" },
});

export const toolUpdateMealEntry = defineTool({
  name: "update_meal_entry",
  title: "Update Meal Entry",
  description:
    "Update an existing meal entry. Use this to correct mistakes in an entry (e.g., wrong calories, wrong food name, wrong portion size). NEVER delete an entry before updating it - just update directly.",
  inputSchema: schemaUpdateMealEntryInput,
  outputSchema: schemaUpdateMealEntryOutput,
  approval: { require: true, confirmLabel: "Update", cancelLabel: "Cancel" },
});

export const toolDeleteMealEntry = defineTool({
  name: "delete_meal_entry",
  title: "Delete Meal Entry",
  description:
    "Permanently delete a meal entry. Only use when the user wants to completely remove an entry they did not actually eat. Do NOT use this to correct mistakes - use update_meal_entry instead.",
  inputSchema: schemaDeleteMealEntry,
  outputSchema: schemaDeleteMealEntryOutput,
  approval: { require: true, confirmLabel: "Delete", cancelLabel: "Keep" },
});
