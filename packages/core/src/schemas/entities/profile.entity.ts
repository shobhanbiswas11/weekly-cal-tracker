import z from "zod";

export const schemaProfileEntity = z.object({
  id: z.string(), // this will be the user id
  // ---------------------------------------------------------------------------
  // Basic Profile Information (user-provided)
  // ---------------------------------------------------------------------------
  name: z.string().describe("User's name"),
  dateOfBirth: z
    .string()
    .describe("User's date of birth in ISO format (YYYY-MM-DD)"),
  biologicalSex: z
    .string()
    .describe("Biological sex (Male or Female) for accurate BMR calculation"),
  height: z.string().describe("Height in feet or centimeters (with unit)"),
  weight: z.string().describe("Current weight in lbs or kg (with unit)"),
  primaryGoal: z
    .string()
    .describe(
      "User's primary fitness/nutrition goal. eg: Loose Weight, Maintain Weight, Gain Muscle, Improve Overall Health",
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
  activityLevel: z
    .string()
    .describe(
      "User's activity level (eg. Sedentary, Light, Moderate, Active, Very Active) - ask if not provided, default to 'Moderate'",
    ),
  bmr: z
    .number()
    .min(500)
    .max(5000)
    .describe("Basal Metabolic Rate in kcal/day - use Mifflin-St Jeor formula"),
  tdee: z
    .number()
    .min(800)
    .max(8000)
    .describe(
      "Total Daily Energy Expenditure = calculate from BMR and activity level",
    ),

  // Calorie Targets
  dailyCalorieTarget: z
    .number()
    .min(800)
    .max(8000)
    .describe("Daily calorie goal based on user's objective"),
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
      "Daily protein target in grams (Calculate based on other profile data)",
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
    .describe(
      "Daily fat target in grams (Calculate based on other profile data)",
    ),

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
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Profile = z.infer<typeof schemaProfileEntity>;
