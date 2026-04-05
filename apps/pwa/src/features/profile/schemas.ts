import z from "zod";

// Result type for the profile setup tool - persists user action in the message
export const ProfileResultSchema = z.object({
  action: z.enum(["saved", "canceled"]),
});

export type ProfileResult = z.infer<typeof ProfileResultSchema>;

// Activity levels with their TDEE multipliers
export const ActivityLevel = z.enum([
  "sedentary", // Little or no exercise (1.2)
  "light", // Light exercise 1-3 days/week (1.375)
  "moderate", // Moderate exercise 3-5 days/week (1.55)
  "active", // Hard exercise 6-7 days/week (1.725)
  "very_active", // Very hard exercise & physical job (1.9)
]);

export type ActivityLevel = z.infer<typeof ActivityLevel>;

// Calculated values computed by the LLM based on user's profile
export const CalculatedValuesSchema = z.object({
  // Activity & Metabolism
  activityLevel: ActivityLevel.describe(
    "User's activity level - ask if not provided, default to 'moderate'",
  ),
  activityMultiplier: z
    .number()
    .describe("TDEE multiplier based on activity level (1.2 - 1.9)"),
  bmr: z
    .number()
    .describe("Basal Metabolic Rate in kcal/day - use Mifflin-St Jeor formula"),
  tdee: z
    .number()
    .describe("Total Daily Energy Expenditure = BMR × activityMultiplier"),

  // Calorie Targets
  dailyCalorieTarget: z
    .number()
    .describe(
      "Daily calorie goal based on user's objective (maintenance = TDEE, loss = TDEE - 500, gain = TDEE + 300)",
    ),
  weeklyCalorieTarget: z
    .number()
    .describe("Weekly calorie goal = dailyCalorieTarget × 7"),
  dailyCalorieAdjustment: z
    .number()
    .describe(
      "Calories above/below TDEE (negative for deficit, positive for surplus, 0 for maintenance)",
    ),

  // Macronutrient Targets (in grams)
  proteinTarget: z
    .number()
    .describe(
      "Daily protein target in grams (typically 0.8-1g per lb body weight)",
    ),
  carbsTarget: z.number().describe("Daily carbohydrates target in grams"),
  fatTarget: z
    .number()
    .describe("Daily fat target in grams (typically 25-30% of calories)"),

  // Goal Projections (optional - for weight change goals)
  targetWeight: z
    .number()
    .optional()
    .describe("Target weight in kg if user has a weight change goal"),
  estimatedWeeklyWeightChange: z
    .number()
    .optional()
    .describe("Estimated weight change per week in kg (negative for loss)"),
  estimatedWeeksToGoal: z
    .number()
    .optional()
    .describe("Estimated weeks to reach target weight"),
});

export type CalculatedValues = z.infer<typeof CalculatedValuesSchema>;

export const ProfileSchema = z.object({
  profile: z
    .array(
      z.object({
        property: z
          .string()
          .describe(
            "Profile field name (e.g., Name, Date of Birth, Biological Sex, Height, Weight, Primary Goal, Additional Notes)",
          ),
        value: z.string().describe("The value for this profile field"),
      }),
    )
    .describe("Array of profile information with property-value pairs"),
  calculatedValues: CalculatedValuesSchema.describe(
    "LLM-calculated nutrition targets based on user's profile data",
  ),
});
