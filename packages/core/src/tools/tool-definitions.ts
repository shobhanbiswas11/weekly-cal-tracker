import z from "zod";
import {
  schemaCreateMealEntry,
  schemaCreateProfile,
  schemaFoodItem,
  schemaMealEntryEntity,
  schemaProfileEntity,
  schemaUpdateMealEntry,
  schemaUpdateProfile,
} from "../schemas";
import { defineTool } from "./types";
export * from "./types";

// Common input schemas
export const schemaIdInput = z.object({
  id: z.string().describe("The unique identifier"),
});

export const schemaDateInput = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format (e.g., 2026-04-11)"),
});

export const schemaCalendarWeekInput = z.object({
  week: z.string().describe("Calendar week in ISO format (e.g., 2026-W15)"),
});

export const schemaLogMealInput = z.object({
  foodItems: z.array(schemaFoodItem),
  ...schemaCreateMealEntry.pick({ date: true, name: true, note: true }).shape,
});
export type LogMealInput = z.infer<typeof schemaLogMealInput>;

// Common output schemas
export const schemaGenericOutput = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const schemaMealEntryOutput = schemaGenericOutput.extend({
  data: schemaMealEntryEntity.optional(),
});

export const schemaMealEntriesOutput = schemaGenericOutput.extend({
  data: z.array(schemaMealEntryEntity).optional(),
});

export const schemaProfileOutput = schemaGenericOutput.extend({
  data: schemaProfileEntity.optional(),
});

export const toolDefinitionRegistry = {
  // ---------------------------------------------------------------------------
  // Meal Entry Tools
  // ---------------------------------------------------------------------------
  log_meal: defineTool({
    name: "log_meal",
    title: "Log Meal",
    description:
      "Log a meal with food items and nutritional information. tool will add-up calories and macros based on the food items provided.",
    inputSchema: schemaLogMealInput,
    outputSchema: schemaMealEntryOutput,
    approval: { require: true, confirmLabel: "Log", cancelLabel: "Cancel" },
  }),

  update_meal_entry: defineTool({
    name: "update_meal_entry",
    title: "Update Meal Entry",
    description:
      "Update an existing meal entry. Only include fields that need to change - omit unchanged fields. Requires the entry's ID (use entries_by_date first if you only know the meal name).",
    inputSchema: schemaUpdateMealEntry.extend({ id: z.string() }),
    outputSchema: schemaMealEntryOutput,
    approval: { require: true, confirmLabel: "Update", cancelLabel: "Cancel" },
  }),

  delete_meal_entry: defineTool({
    name: "delete_meal_entry",
    title: "Delete Meal Entry",
    description:
      "Delete a meal entry by its ID. If user refers to a meal by name (e.g., 'delete the biryani'), first use entries_by_date to find the entry and get its actual ID.",
    inputSchema: schemaIdInput,
    outputSchema: schemaGenericOutput,
    approval: { require: true, confirmLabel: "Delete", cancelLabel: "Cancel" },
  }),

  get_meal_entry: defineTool({
    name: "get_meal_entry",
    title: "Get Meal Entry",
    description: "Retrieve a specific meal entry by its ID",
    inputSchema: schemaIdInput,
    outputSchema: schemaMealEntryOutput,
  }),

  entries_by_calendar_week: defineTool({
    name: "entries_by_calendar_week",
    title: "Get Entries by Week",
    description:
      "Retrieve all meal entries for a specific calendar week (e.g., 2026-W15)",
    inputSchema: schemaCalendarWeekInput,
    outputSchema: schemaMealEntriesOutput,
  }),

  entries_by_date: defineTool({
    name: "entries_by_date",
    title: "Get Entries by Date",
    description:
      "Retrieve all meal entries for a specific date. Use this when user asks 'what did I eat today' or before deleting/updating a meal by name.",
    inputSchema: schemaDateInput,
    outputSchema: schemaMealEntriesOutput,
  }),

  // ---------------------------------------------------------------------------
  // Profile Tools
  // ---------------------------------------------------------------------------
  create_profile: defineTool({
    name: "create_profile",
    title: "Create Profile",
    description:
      "Create a new user profile with personal and fitness information",
    inputSchema: schemaCreateProfile,
    outputSchema: schemaGenericOutput,
    approval: { require: true, confirmLabel: "Create", cancelLabel: "Cancel" },
  }),

  update_profile: defineTool({
    name: "update_profile",
    title: "Update Profile",
    description: "Update an existing user profile",
    inputSchema: schemaUpdateProfile,
    outputSchema: schemaGenericOutput,
    approval: { require: true, confirmLabel: "Update", cancelLabel: "Cancel" },
  }),

  get_profile: defineTool({
    name: "get_profile",
    title: "Get Profile",
    description:
      "Retrieve the user's profile. Only use when user specifically asks about their goals, progress, or profile info.",
    inputSchema: z.object({}),
    outputSchema: schemaProfileOutput,
  }),

  delete_profile: defineTool({
    name: "delete_profile",
    title: "Delete Profile",
    description: "Delete the current user's profile",
    inputSchema: z.object({}),
    outputSchema: schemaGenericOutput,
    approval: { require: true, confirmLabel: "Delete", cancelLabel: "Cancel" },
  }),
} as const;

export type ToolName = keyof typeof toolDefinitionRegistry;

// Extract the output schema type, handling the optional nature
export type ToolOutputSchema<K extends ToolName> = NonNullable<
  (typeof toolDefinitionRegistry)[K]["outputSchema"]
>;
export type ToolInputSchema<K extends ToolName> =
  (typeof toolDefinitionRegistry)[K]["inputSchema"];

export type ToolExecutorRegistry = {
  [K in ToolName]?: (
    input: z.infer<ToolInputSchema<K>>,
  ) => Promise<z.infer<ToolOutputSchema<K>>>;
};

// Helper to enforce both input and output types for a specific tool
export function defineExecutor<K extends ToolName>(
  _name: K,
  executor: (
    input: z.infer<ToolInputSchema<K>>,
  ) => Promise<z.infer<ToolOutputSchema<K>>>,
) {
  return executor;
}
