import z from "zod";

export const schemaBiologicalSex = z.enum(["Male", "Female"]);
export type BiologicalSex = z.infer<typeof schemaBiologicalSex>;

export const schemaActivityLevel = z.enum([
  "Sedentary",
  "Lightly Active",
  "Moderately Active",
  "Very Active",
  "Super Active",
]);
export type ActivityLevel = z.infer<typeof schemaActivityLevel>;

export const mapActivityMultipliers: Record<ActivityLevel, number> = {
  Sedentary: 1.2,
  "Lightly Active": 1.375,
  "Moderately Active": 1.55,
  "Very Active": 1.725,
  "Super Active": 1.9,
};

export const schemaGoal = z.enum([
  "Lose Weight",
  "Maintain Healthy Lifestyle",
  "Gain Weight",
]);
export type Goal = z.infer<typeof schemaGoal>;

export const schemaHeightUnit = z.enum(["cm", "ft"]);
export type HeightUnit = z.infer<typeof schemaHeightUnit>;

export const schemaWeightUnit = z.enum(["kg", "lbs"]);
export type WeightUnit = z.infer<typeof schemaWeightUnit>;

// =============================================================================
// Subscription
// =============================================================================

export const FREE_TIER_CHAT_LIMIT = 20;
export const REVENUECAT_ENTITLEMENT_ID = "Weekly Health Pro";
