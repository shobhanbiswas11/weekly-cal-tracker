import z from "zod";

// =============================================================================
// Calorie Entry View Schema
// =============================================================================

/**
 * Frontend presentation view of a meal entry.
 * Transforms the stored MealEntry into a display-friendly format
 * with date and time separated.
 */
export const schemaCalorieEntry = z.object({
  id: z.string(),
  date: z.string().describe("Date in YYYY-MM-DD format"),
  time: z.string().describe("Time in HH:mm format"),
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
});

export type CalorieEntry = z.infer<typeof schemaCalorieEntry>;
