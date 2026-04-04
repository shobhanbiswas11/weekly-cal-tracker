import z from "zod";

/**
 * FUTURE GROUNDING OPTIONS for accurate calorie/nutrition data:
 *
 * 1. USDA FoodData Central API (free)
 *    - https://fdc.nal.usda.gov/api-guide.html
 *    - Comprehensive nutrition data for generic foods
 *
 * 2. Nutritionix API (freemium)
 *    - https://www.nutritionix.com/business/api
 *    - Natural language food parsing, restaurant/branded foods
 *
 * 3. Open Food Facts (free, open source)
 *    - https://world.openfoodfacts.org/data
 *    - Crowdsourced packaged food database with barcodes
 *
 * 4. Edamam Food Database API (freemium)
 *    - https://developer.edamam.com/food-database-api
 *    - Recipe analysis and food parsing
 *
 * 5. CalorieNinjas API (freemium)
 *    - https://calorieninjas.com/api
 *    - Simple natural language nutrition lookup
 *
 * Integration approach: Before calling preview_meal_log, use a grounding tool
 * to fetch actual nutrition data, then pass verified values to preview_meal_log.
 */

const MealItemSchema = z.object({
  name: z
    .string()
    .describe(
      "Name of the food item type (e.g., 'Egg', 'Toast with butter', 'Orange juice'). Use singular form when quantity > 1.",
    ),
  quantity: z
    .number()
    .min(1)
    .default(1)
    .describe(
      "Number of this item (e.g., 2 for '2 eggs'). Group identical items together instead of listing separately.",
    ),
  calories: z
    .number()
    .min(0)
    .describe(
      "Estimated calories for ALL items of this type (quantity × per-item calories)",
    ),
  protein: z
    .number()
    .min(0)
    .describe("Estimated protein in grams for ALL items of this type"),
  carbs: z
    .number()
    .min(0)
    .describe("Estimated carbs in grams for ALL items of this type"),
  fat: z
    .number()
    .min(0)
    .describe("Estimated fat in grams for ALL items of this type"),
  fiber: z
    .number()
    .min(0)
    .optional()
    .describe("Estimated fiber in grams for ALL items of this type"),
  sugar: z
    .number()
    .min(0)
    .optional()
    .describe("Estimated sugar in grams for ALL items of this type"),
  sodium: z
    .number()
    .min(0)
    .optional()
    .describe("Estimated sodium in mg for ALL items of this type"),
});

export const LogMealSchema = z.object({
  meal: z.object({
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
    items: z
      .array(MealItemSchema)
      .describe(
        "Breakdown of individual food items in the meal with their estimated nutrition. This shows the user how the total was calculated.",
      ),
    calories: z
      .number()
      .positive()
      .describe("Total calories for the entire meal combined."),
    protein: z
      .number()
      .min(0)
      .describe("Total protein in grams for the entire meal."),
    carbs: z
      .number()
      .min(0)
      .describe("Total carbohydrates in grams for the entire meal."),
    fat: z.number().min(0).describe("Total fat in grams for the entire meal."),
    fiber: z
      .number()
      .min(0)
      .optional()
      .describe("Total fiber in grams for the meal."),
    sugar: z
      .number()
      .min(0)
      .optional()
      .describe("Total sugar in grams for the meal."),
    sodium: z
      .number()
      .min(0)
      .optional()
      .describe("Total sodium in mg for the meal."),
    date: z
      .string()
      .optional()
      .describe(
        "Date of the meal in YYYY-MM-DD format. Calculate relative dates from today's date provided in system context. Omit if user says 'just ate' or no time reference (defaults to today).",
      ),
    note: z
      .string()
      .optional()
      .describe("Optional note with additional context about the meal."),
  }),
});

export type LogMealInput = z.infer<typeof LogMealSchema>;
