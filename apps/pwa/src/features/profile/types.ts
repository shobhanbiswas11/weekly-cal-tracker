// User profile types for AI-powered calorie/fitness tracking
// This data is sent as context to the LLM for personalized recommendations

// ============================================================================
// Union Types (Constrained Values)
// ============================================================================

export type BiologicalSex = "male" | "female";

export type PrimaryGoal =
  | "lose_weight"
  | "gain_muscle"
  | "maintain"
  | "body_recomposition"
  | "improve_health";

export type ActivityLevel =
  | "sedentary" // Little or no exercise, desk job
  | "lightly_active" // Light exercise 1-3 days/week
  | "moderately_active" // Moderate exercise 3-5 days/week
  | "very_active" // Hard exercise 6-7 days/week
  | "extremely_active"; // Very hard exercise, physical job, or training twice/day

export type Occupation =
  | "desk_job" // Mostly sitting
  | "standing_job" // Retail, teaching, etc.
  | "physical_labor" // Construction, warehouse, etc.
  | "mixed"; // Combination

export type ExerciseType =
  | "strength_training"
  | "cardio"
  | "hiit"
  | "yoga"
  | "pilates"
  | "swimming"
  | "cycling"
  | "running"
  | "walking"
  | "sports"
  | "martial_arts"
  | "dance"
  | "other";

export type DietaryRestriction =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto"
  | "paleo"
  | "low_carb"
  | "low_fat"
  | "gluten_free"
  | "dairy_free"
  | "halal"
  | "kosher"
  | "whole30"
  | "mediterranean"
  | "other";

export type FoodAllergy =
  | "peanuts"
  | "tree_nuts"
  | "milk"
  | "eggs"
  | "wheat"
  | "soy"
  | "fish"
  | "shellfish"
  | "sesame"
  | "other";

export type FoodIntolerance =
  | "lactose"
  | "gluten"
  | "fructose"
  | "fodmap"
  | "histamine"
  | "sulfites"
  | "other";

export type PregnancyStatus = "not_applicable" | "pregnant" | "breastfeeding";

export type UnitSystem = "metric" | "imperial";

// ============================================================================
// Core Profile Interface
// ============================================================================

export interface UserProfile {
  // Metadata
  id: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  // Core Demographics
  name?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  biologicalSex?: BiologicalSex;
  height?: number; // cm (metric) or inches (imperial)
  currentWeight?: number; // kg (metric) or lbs (imperial)

  // Body Composition (Optional - for advanced tracking)
  bodyFatPercentage?: number; // 0-100
  muscleMass?: number; // kg or lbs
  waistCircumference?: number; // cm or inches

  // Goals
  primaryGoal?: PrimaryGoal;
  targetWeight?: number; // kg or lbs
  weeklyWeightChangeTarget?: number; // kg or lbs per week (positive = gain, negative = lose)
  targetDate?: string; // YYYY-MM-DD

  // Activity Level
  activityLevel?: ActivityLevel;
  exerciseFrequency?: number; // days per week (0-7)
  exerciseTypes?: ExerciseType[];
  stepGoal?: number; // daily steps
  occupation?: Occupation;

  // Dietary Preferences
  dietaryRestrictions?: DietaryRestriction[];
  allergies?: FoodAllergy[];
  foodIntolerances?: FoodIntolerance[];
  cuisinePreferences?: string[]; // Free text: "indian", "mexican", "mediterranean", etc.
  mealFrequency?: number; // meals per day (typically 2-6)

  // Health Information
  medicalConditions?: string[]; // Free text: "diabetes", "hypothyroidism", "pcos", etc.
  medications?: string[]; // Free text: medication names
  pregnancyStatus?: PregnancyStatus;

  // Measurement Preferences
  unitSystem: UnitSystem;

  // AI-Calculated Targets (set by LLM, stored for reference)
  calculatedTargets?: ProfileCalculations;
}

// ============================================================================
// AI-Calculated Values
// ============================================================================

export interface ProfileCalculations {
  dailyCalorieTarget: number;
  proteinTarget: number; // grams
  carbsTarget: number; // grams
  fatTarget: number; // grams
  fiberTarget?: number; // grams
  waterTarget?: number; // ml or oz
  lastCalculatedAt: string; // ISO timestamp
  calculationNotes?: string; // AI explanation of how targets were determined
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * For partial profile updates
 */
export type ProfileUpdate = Partial<Omit<UserProfile, "id" | "createdAt">>;

/**
 * Profile fields that are required for accurate AI calculations
 */
export type CoreProfileFields = Pick<
  UserProfile,
  | "dateOfBirth"
  | "biologicalSex"
  | "height"
  | "currentWeight"
  | "activityLevel"
  | "primaryGoal"
>;

/**
 * Check if core profile is complete enough for AI calculations
 */
export function isProfileComplete(
  profile: UserProfile,
): profile is UserProfile & Required<CoreProfileFields> {
  return (
    profile.dateOfBirth !== undefined &&
    profile.biologicalSex !== undefined &&
    profile.height !== undefined &&
    profile.currentWeight !== undefined &&
    profile.activityLevel !== undefined &&
    profile.primaryGoal !== undefined
  );
}

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_PROFILE: Partial<UserProfile> = {
  unitSystem: "metric",
  activityLevel: "moderately_active",
  mealFrequency: 3,
  pregnancyStatus: "not_applicable",
  exerciseTypes: [],
  dietaryRestrictions: [],
  allergies: [],
  foodIntolerances: [],
  cuisinePreferences: [],
  medicalConditions: [],
  medications: [],
};

// ============================================================================
// Display Labels (for UI)
// ============================================================================

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (little or no exercise)",
  lightly_active: "Lightly Active (1-3 days/week)",
  moderately_active: "Moderately Active (3-5 days/week)",
  very_active: "Very Active (6-7 days/week)",
  extremely_active: "Extremely Active (athlete/physical job)",
};

export const PRIMARY_GOAL_LABELS: Record<PrimaryGoal, string> = {
  lose_weight: "Lose Weight",
  gain_muscle: "Gain Muscle",
  maintain: "Maintain Weight",
  body_recomposition: "Body Recomposition",
  improve_health: "Improve Overall Health",
};

export const DIETARY_RESTRICTION_LABELS: Record<DietaryRestriction, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
  keto: "Keto",
  paleo: "Paleo",
  low_carb: "Low Carb",
  low_fat: "Low Fat",
  gluten_free: "Gluten Free",
  dairy_free: "Dairy Free",
  halal: "Halal",
  kosher: "Kosher",
  whole30: "Whole30",
  mediterranean: "Mediterranean",
  other: "Other",
};

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  strength_training: "Strength Training",
  cardio: "Cardio",
  hiit: "HIIT",
  yoga: "Yoga",
  pilates: "Pilates",
  swimming: "Swimming",
  cycling: "Cycling",
  running: "Running",
  walking: "Walking",
  sports: "Sports",
  martial_arts: "Martial Arts",
  dance: "Dance",
  other: "Other",
};
