import z from "zod";

export const schemaMealEntryEntity = z.object({
  id: z.string(),
  date: z.iso.date().describe("Date of the meal in YYYY-MM-DD format"),
  name: z
    .string()
    .describe(
      "Short name of the meal, e.g., '2 egg whites with pasta', 'Light Dinner with salad', 'Biryani with raita', etc. Important: Only should describe the food items",
    ),
  calories: z.number().min(0).describe("Total calories in kcal"),
  protein: z.number().min(0).describe("Total protein in grams"),
  carbs: z.number().min(0).describe("Total carbohydrates in grams"),
  fats: z.number().min(0).describe("Total fat in grams"),
  fiber: z.number().min(0).describe("Total fiber in grams"),
  sugar: z.number().min(0).describe("Total sugar in grams"),
  sodium: z.number().min(0).describe("Total sodium in mg"),
  note: z
    .string()
    .nullable()
    .describe(
      "Additional short notes only specific to the meal, e.g., 'Meal taken late at night', 'Sodium quantity high', 'Cheat Meal' etc. Don't put random stuff",
    ),
  foodItems: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "Name of the food item, e.g., 'egg white', 'pasta', 'salad', etc.",
          ),
        quantity: z
          .string()
          .describe(
            "Quantity of the food item, e.g., '2 large', '1 cup', '150g', etc.",
          ),
      }),
    )
    .nullable()
    .describe("Optional list of food items in the meal"),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type MealEntry = z.infer<typeof schemaMealEntryEntity>;
