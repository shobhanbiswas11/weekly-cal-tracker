import z from "zod";
import {
  schemaCreateMealEntry,
  schemaFoodItem,
  schemaMealEntryEntity,
  schemaProfileEntity,
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

// Token-optimized schema for meal entries
// Keys: id, n=name, nt=note, d=date, cal=calories, P=protein, C=carbs, F=fats
export const schemaMealEntryCompact = z.object({
  id: z.string(),
  n: z.string().describe("Meal name"),
  nt: z.string().nullable().describe("Note"),
  d: z.string().describe("Date YYYY-MM-DD"),
  cal: z.number().describe("Calories kcal"),
  P: z.number().describe("Protein g"),
  C: z.number().describe("Carbs g"),
  F: z.number().describe("Fats g"),
});

export const schemaMealEntriesCompactOutput = schemaGenericOutput.extend({
  data: z.array(schemaMealEntryCompact).optional(),
});

export const toolDefinitionRegistry = {
  // Backend Query Tools
  get_meal_entries_by_date: defineTool({
    name: "get_meal_entries_by_date",
    title: "Get Meal Entries by Date",
    description:
      "Get all meals for a date. Returns compact data: id, n(name), nt(note), d(date), cal(kcal), P(protein g), C(carbs g), F(fats g).",
    inputSchema: schemaDateInput,
    outputSchema: schemaMealEntriesCompactOutput,
  }),
  get_meal_entries_by_week: defineTool({
    name: "get_meal_entries_by_week",
    title: "Get Meal Entries by Week",
    description:
      "Get all meals for a calendar week (ISO format like 2026-W15). Returns compact data: id, n(name), nt(note), d(date), cal(kcal), P(protein g), C(carbs g), F(fats g).",
    inputSchema: schemaCalendarWeekInput,
    outputSchema: schemaMealEntriesCompactOutput,
  }),

  // Frontend-only tools
  preview_meal: defineTool({
    type: "frontend",
    name: "preview_meal",
    title: "Preview Meal",
    description:
      "Frontend-only tool to render a visual meal preview card. Use before log_meal to show user what will be logged",
    inputSchema: schemaLogMealInput,
  }),
  modify_entity: defineTool({
    type: "frontend",
    name: "modify_entity",
    title: "Modify Entity",
    description: `Modify an existing entity.
Entities requiring ID: meal
Entities without ID: profile
Fields by entity - Profile: ${Object.keys(schemaUpdateProfile.shape).join(", ")} | Meal: ${Object.keys(schemaCreateMealEntry.shape).join(", ")}`,
    inputSchema: z.object({
      entity: z.enum(["meal", "profile"]),
      action: z.enum(["update", "delete"]),
      id: z.string().nullable(),
      data: z.record(z.string(), z.any()).nullable(),
    }),
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

export function getToolName(name: ToolName): ToolName {
  return name;
}
