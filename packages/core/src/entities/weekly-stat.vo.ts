import z from "zod";

export const schemaWeeklyStat = z.object({
  weekId: z.string().describe("Week identifier in YYYY-WW format"),
  days: z.array(
    z.object({
      date: z.string().describe("Date in YYYY-MM-DD format"),
      caloriesConsumed: z
        .number()
        .describe("Total calories consumed on this day"),
      caloriesBurned: z.number().describe("Total calories burned on this day"),
      estimated: z
        .boolean()
        .optional()
        .describe(
          "Whether this day's stats are estimated (e.g., without entries)",
        ),
    }),
  ),
  calorieBudget: z.number().describe("Calorie budget for the week"),
  caloriesConsumed: z.number().describe("Total calories consumed for the week"),
  caloriesBurned: z
    .number()
    .describe("Total calories burned through activities for the week"),
});

export type WeeklyStat = z.infer<typeof schemaWeeklyStat>;
