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
      .describe("Total fiber in grams for the meal if applicable."),
    sugar: z
      .number()
      .min(0)
      .optional()
      .describe("Total sugar in grams if significant or known."),
    sodium: z
      .number()
      .min(0)
      .optional()
      .describe("Total sodium in mg if significant or known."),
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

// Legacy schema for backward compatibility
export const LogFoodSchema = z.object({
  food: z.object({
    name: z.string(),
    calories: z.number().positive(),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
    fiber: z.number().min(0).optional(),
    sugar: z.number().min(0).optional(),
    sodium: z.number().min(0).optional(),
    date: z.string().optional(),
    note: z.string().optional(),
  }),
});

export type LogFoodInput = z.infer<typeof LogFoodSchema>;
