import z from "zod";

// =============================================================================
// User Goals Schema
// =============================================================================

/**
 * Daily macro nutrient goals derived from user profile.
 * Used for tracking progress against targets.
 */
export const schemaUserGoals = z.object({
  dailyCalorieGoal: z.number(),
  proteinGoal: z.number(),
  carbsGoal: z.number(),
  fatGoal: z.number(),
});

export type UserGoals = z.infer<typeof schemaUserGoals>;
