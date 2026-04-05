import z from "zod";

export const schemaActivityLevel = z
  .enum(["sedentary", "light", "moderate", "active", "very_active"])
  .describe("User's physical activity level for TDEE calculation");

export const schemaBiologicalSex = z
  .enum(["male", "female"])
  .describe(
    "Biological sex for accurate BMR calculation using Mifflin-St Jeor formula",
  );

export const schemaPrimaryGoal = z
  .enum(["lose_weight", "maintain_weight", "gain_muscle", "improve_health"])
  .describe("User's primary fitness/nutrition goal");

export const schemaCreateProfile = z.object({
  // ---------------------------------------------------------------------------
  // Basic Profile Information (user-provided)
  // ---------------------------------------------------------------------------
  name: z.string().describe("User's name"),
  dateOfBirth: z
    .string()
    .describe("User's date of birth in ISO format (YYYY-MM-DD)"),
  biologicalSex: schemaBiologicalSex.describe(
    "Biological sex for accurate BMR calculation",
  ),
  heightCm: z.number().min(50).max(300).describe("Height in centimeters"),
  weightKg: z.number().min(20).max(500).describe("Current weight in kilograms"),
  primaryGoal: schemaPrimaryGoal.describe(
    "User's primary fitness/nutrition goal",
  ),
  additionalNotes: z
    .string()
    .optional()
    .describe(
      "Any additional notes about dietary restrictions, preferences, or health conditions",
    ),

  // ---------------------------------------------------------------------------
  // Calculated Values (LLM-computed based on profile)
  // ---------------------------------------------------------------------------
  activityLevel: schemaActivityLevel.describe(
    "User's activity level - ask if not provided, default to 'moderate'",
  ),
  activityMultiplier: z
    .number()
    .min(1.2)
    .max(1.9)
    .describe("TDEE multiplier based on activity level (1.2 - 1.9)"),
  bmr: z
    .number()
    .min(500)
    .max(5000)
    .describe("Basal Metabolic Rate in kcal/day - use Mifflin-St Jeor formula"),
  tdee: z
    .number()
    .min(800)
    .max(8000)
    .describe("Total Daily Energy Expenditure = BMR × activityMultiplier"),

  // Calorie Targets
  dailyCalorieTarget: z
    .number()
    .min(800)
    .max(8000)
    .describe(
      "Daily calorie goal based on user's objective (maintenance = TDEE, loss = TDEE - 500, gain = TDEE + 300)",
    ),
  weeklyCalorieTarget: z
    .number()
    .min(5600)
    .max(56000)
    .describe("Weekly calorie goal = dailyCalorieTarget × 7"),
  dailyCalorieAdjustment: z
    .number()
    .describe(
      "Calories above/below TDEE (negative for deficit, positive for surplus, 0 for maintenance)",
    ),

  // Macronutrient Targets (in grams)
  proteinTarget: z
    .number()
    .min(30)
    .max(400)
    .describe(
      "Daily protein target in grams (typically 0.8-1g per lb body weight)",
    ),
  carbsTarget: z
    .number()
    .min(50)
    .max(800)
    .describe("Daily carbohydrates target in grams"),
  fatTarget: z
    .number()
    .min(20)
    .max(300)
    .describe("Daily fat target in grams (typically 25-30% of calories)"),

  // Goal Projections (optional - for weight change goals)
  targetWeight: z
    .number()
    .min(20)
    .max(500)
    .optional()
    .describe("Target weight in kg if user has a weight change goal"),
  estimatedWeeklyWeightChange: z
    .number()
    .optional()
    .describe("Estimated weight change per week in kg (negative for loss)"),
  estimatedWeeksToGoal: z
    .number()
    .min(0)
    .optional()
    .describe("Estimated weeks to reach target weight"),
});

// Update schema - all fields optional for partial updates
export const schemaUpdateProfile = schemaCreateProfile.partial();

export type CreateProfileDto = z.infer<typeof schemaCreateProfile>;
export type UpdateProfileDto = z.infer<typeof schemaUpdateProfile>;
