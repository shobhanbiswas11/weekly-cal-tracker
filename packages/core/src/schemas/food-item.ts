import { z } from "zod";
// Food item with full macros (what AI passes to log_meal tool)
export const schemaFoodItem = z.object({
  emoji: z
    .string()
    .describe("A single emoji representing this food (e.g., '🍕', '🥗', '🍳')"),
  name: z.string().describe("Name of the food item (e.g., 'Pizza', 'Salad')"),
  quantity: z
    .string()
    .describe("Human-readable quantity (e.g., '2 slices', '1 bowl', '200g')"),
  calories: z.number().min(0).describe("Estimated calories for this item"),
  protein: z.number().min(0).describe("Estimated protein in grams"),
  carbs: z.number().min(0).describe("Estimated carbs in grams"),
  fats: z.number().min(0).describe("Estimated fat in grams"),
  fiber: z
    .number()
    .min(0)
    .nullable()
    .describe("Estimated fiber in grams (optional)"),
  sugar: z
    .number()
    .min(0)
    .nullable()
    .describe("Estimated sugar in grams (optional)"),
  sodium: z
    .number()
    .min(0)
    .nullable()
    .describe("Estimated sodium in mg (optional)"),
});

export type FoodItem = z.infer<typeof schemaFoodItem>;
