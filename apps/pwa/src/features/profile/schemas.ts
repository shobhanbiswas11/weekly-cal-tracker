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
export const CalculatedValuesSchema = z
  .object({
    // Activity & Metabolism
    activityLevel: ActivityLevel.describe(
      "User's activity level - ask if not provided, default to 'moderate'",
    ),
    activityMultiplier: z
      .number()
      .describe("TDEE multiplier based on activity level (1.2 - 1.9)"),
    bmr: z
      .number()
      .describe(
        "Basal Metabolic Rate in kcal/day - use Mifflin-St Jeor formula",
      ),
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
  })
  .describe("LLM-calculated nutrition targets based on user's profile data");

// Biological sex for BMR calculations
export const BiologicalSex = z.enum(["male", "female"]);
export type BiologicalSex = z.infer<typeof BiologicalSex>;

// Primary fitness/nutrition goal
export const PrimaryGoal = z.enum([
  "lose_weight", // Caloric deficit
  "maintain_weight", // Eat at TDEE
  "gain_muscle", // Caloric surplus with high protein
  "improve_health", // Focus on nutrition quality
]);
export type PrimaryGoal = z.infer<typeof PrimaryGoal>;

// Basic user profile information
export const BasicProfileSchema = z.object({
  name: z.string().describe("User's name"),
  dateOfBirth: z
    .string()
    .describe("User's date of birth in ISO format (YYYY-MM-DD)"),
  biologicalSex: BiologicalSex.describe(
    "Biological sex for accurate BMR calculation",
  ),
  heightCm: z.number().describe("Height in centimeters"),
  weightKg: z.number().describe("Current weight in kilograms"),
  primaryGoal: PrimaryGoal.describe("User's primary fitness/nutrition goal"),
  additionalNotes: z
    .string()
    .optional()
    .describe(
      "Any additional notes about dietary restrictions, preferences, or health conditions",
    ),
});

// Complete profile - flat structure for database storage
// Combines basic info and calculated values at the top level
export const ProfileSchema = BasicProfileSchema.merge(CalculatedValuesSchema);

export type BasicProfile = z.infer<typeof BasicProfileSchema>;
export type CalculatedValues = z.infer<typeof CalculatedValuesSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
