import z from "zod";

// Individual food item for display purposes
export const schemaFoodItem = z.object({
  emoji: z
    .string()
    .describe("A single emoji representing this food (e.g., '🍕', '🥗', '🍳')"),
  name: z.string().describe("Name of the food item (e.g., 'Pizza', 'Salad')"),
  quantity: z
    .string()
    .describe(
      "Human-readable quantity (e.g., '2 slices', '1 bowl', '200g', '1 cup')",
    ),
  calories: z
    .number()
    .min(0)
    .optional()
    .describe("Calories for this specific item (optional)"),
});

export type FoodItem = z.infer<typeof schemaFoodItem>;

export const schemaMealEntryEntity = z.object({
  id: z.string(),
  date: z.iso
    .date()
    .describe(
      "Date of the meal in YYYY-MM-DD format. Calculate relative dates from today's date provided in system context. Omit if user says 'just ate' or no time reference (defaults to today).",
    ),
  name: z
    .string()
    .describe(
      "Short name for the meal (e.g., 'Breakfast', 'Lunch at Chipotle', 'Post-workout snack')",
    ),
  description: z
    .string()
    .describe(
      "Brief description of what the meal contained (e.g., '2 eggs, toast with butter, orange juice')",
    ),
  foods: z
    .array(schemaFoodItem)
    .describe(
      "Individual food items in this meal with emoji, name, and quantity for display. Extract each distinct food from the description.",
    ),
  calories: z
    .number()
    .min(0)
    .describe("Total calories for the entire meal in kcal"),
  protein: z
    .number()
    .min(0)
    .describe("Total protein in grams for the entire meal"),
  carbs: z
    .number()
    .min(0)
    .describe("Total carbohydrates in grams for the entire meal"),
  fats: z.number().min(0).describe("Total fat in grams for the entire meal"),
  fiber: z
    .number()
    .min(0)
    .nullable()
    .describe("Total fiber in grams for the meal"),
  sugar: z
    .number()
    .min(0)
    .nullable()
    .describe("Total sugar in grams for the meal"),
  sodium: z
    .number()
    .min(0)
    .nullable()
    .describe("Total sodium in milligrams for the meal"),
  note: z
    .string()
    .nullable()
    .describe("Optional note with additional context about the meal"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type MealEntry = z.infer<typeof schemaMealEntryEntity>;
