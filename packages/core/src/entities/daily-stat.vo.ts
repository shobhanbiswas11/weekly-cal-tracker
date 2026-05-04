import z from "zod";
import { schemaNutrients } from "./nutrient.vo";

export const schemaDailyStat = z.object({
  date: z.string().describe("Date in YYYY-MM-DD format"),
  calorieBudget: z.number().describe("Calorie budget for the day"),
  caloriesConsumed: z.number().describe("Total calories consumed for the day"),
  caloriesBurned: z
    .number()
    .describe("Total calories burned through activities for the day"),
  nutrientsConsumption: schemaNutrients
    .describe("Total nutrients consumed for the day")
    .omit({ calories: true }), // calories are tracked separately
});

export type DailyStat = z.infer<typeof schemaDailyStat>;
