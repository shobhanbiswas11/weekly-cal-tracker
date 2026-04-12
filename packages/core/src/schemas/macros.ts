import z from "zod";

// =============================================================================
// Macro Nutrient Schemas
// =============================================================================

/**
 * Aggregated macro nutrient totals
 */
export const schemaMacroTotals = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().optional(),
  sugar: z.number().optional(),
  sodium: z.number().optional(),
});

export type MacroTotals = z.infer<typeof schemaMacroTotals>;

/**
 * Enum of all trackable macro nutrient types
 */
export const schemaMacroType = z.enum([
  "calories",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sugar",
  "sodium",
]);

export type MacroType = z.infer<typeof schemaMacroType>;
