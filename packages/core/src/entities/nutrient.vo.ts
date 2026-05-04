import z from "zod";

export const schemaNutrients = z.object({
  calories: z.number().min(0).describe("Total calories in kcal"),
  protein: z.number().min(0).describe("Total protein in grams"),
  carbs: z.number().min(0).describe("Total carbohydrates in grams"),
  fats: z.number().min(0).describe("Total fat in grams"),
  fiber: z.number().min(0).describe("Total fiber in grams"),
  sugar: z.number().min(0).describe("Total sugar in grams"),
  sodium: z.number().min(0).describe("Total sodium in mg"),
});

export type Nutrients = z.infer<typeof schemaNutrients>;
