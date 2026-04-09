export * from "./types";

// Meal entry tools
export {
  schemaCreateMealEntryOutput,
  // Input schemas
  schemaDeleteMealEntry,
  schemaDeleteMealEntryOutput,
  schemaGetEntriesByDate,
  // Output schemas
  schemaGetEntriesByDateOutput,
  schemaGetEntriesByDateRange,
  schemaGetEntriesByDateRangeOutput,
  schemaGetEntryById,
  schemaGetEntryByIdOutput,
  schemaUpdateMealEntryInput,
  schemaUpdateMealEntryOutput,
  // Tool definitions
  toolCreateMealEntry,
  toolDeleteMealEntry,
  toolGetEntriesByDate,
  toolGetEntriesByDateRange,
  toolGetEntryById,
  toolUpdateMealEntry,
} from "./meal-entry.tools";

// Profile tools
export {
  schemaCreateProfileOutput,
  schemaDeleteProfileOutput,
  // Output schemas
  schemaGetProfileOutput,
  schemaUpdateProfileOutput,
  // Tool definitions
  toolCreateProfile,
  toolDeleteProfile,
  toolGetProfile,
  toolUpdateProfile,
} from "./profile.tools";

// =============================================================================
// Tool Registry - All tools indexed by name
// =============================================================================

import {
  toolCreateMealEntry,
  toolDeleteMealEntry,
  toolGetEntriesByDate,
  toolGetEntriesByDateRange,
  toolGetEntryById,
  toolUpdateMealEntry,
} from "./meal-entry.tools";

import {
  toolCreateProfile,
  toolDeleteProfile,
  toolGetProfile,
  toolUpdateProfile,
} from "./profile.tools";

export const toolRegistry = {
  get_entries_by_date: toolGetEntriesByDate,
  get_entries_by_date_range: toolGetEntriesByDateRange,
  get_entry_by_id: toolGetEntryById,
  create_meal_entry: toolCreateMealEntry,
  update_meal_entry: toolUpdateMealEntry,
  delete_meal_entry: toolDeleteMealEntry,
  get_profile: toolGetProfile,
  create_profile: toolCreateProfile,
  update_profile: toolUpdateProfile,
  delete_profile: toolDeleteProfile,
} as const;

export type ToolName = keyof typeof toolRegistry;
