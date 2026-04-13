import z from "zod";

export const schemaMealEntryEntity = z.object({
  id: z.string(),
  date: z.iso.date().describe("Date of the meal in YYYY-MM-DD format"),
  name: z
    .string()
    .describe(
      "Short name of the meal, e.g., '2 egg whites with pasta', 'Light Dinner with salad', 'Biryani with raita', etc.",
    ),
  calories: z.number().min(0).describe("Total calories in kcal"),
  protein: z.number().min(0).describe("Total protein in grams"),
  carbs: z.number().min(0).describe("Total carbohydrates in grams"),
  fats: z.number().min(0).describe("Total fat in grams"),
  fiber: z.number().min(0).nullable().describe("Total fiber in grams"),
  sugar: z.number().min(0).nullable().describe("Total sugar in grams"),
  sodium: z.number().min(0).nullable().describe("Total sodium in mg"),
  note: z
    .string()
    .nullable()
    .describe(
      "Additional notes about the meal, e.g., 'Meal taken late at night', 'Sodium quantity high', 'Cheat Meal' etc.",
    ),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type MealEntry = z.infer<typeof schemaMealEntryEntity>;
