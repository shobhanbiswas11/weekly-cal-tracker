import z from "zod";
import {
  schemaActivityLevel,
  schemaBiologicalSex,
  schemaGoal,
  schemaHeightUnit,
  schemaWeightUnit,
} from "../constants";

export const schemaProfileEntity = z.object({
  id: z.string(), // this will be the user id

  // ---------------------------------------------------------------------------
  name: z.string().describe("User's name"),
  dateOfBirth: z
    .string()
    .describe("User's date of birth in ISO format (YYYY-MM-DD)"),
  biologicalSex: schemaBiologicalSex.describe(
    "Biological sex (Male or Female) for accurate BMR calculation",
  ),
  height: z.number().describe("Height in centimeters"),
  weight: z.number().describe("Current weight in kilograms"),
  activityLevel: schemaActivityLevel.describe(
    "Activity level (Sedentary, Lightly Active, Moderately Active, Very Active, Super Active)",
  ),
  goal: schemaGoal.describe("User's goal for weight management"),

  // ---------------------------------------------------------------------------
  preferences: z
    .object({
      heightUnit: schemaHeightUnit
        .default("cm")
        .describe("Preferred unit for displaying height"),
      weightUnit: schemaWeightUnit
        .default("kg")
        .describe("Preferred unit for displaying weight"),
    })
    .default({ heightUnit: "cm", weightUnit: "kg" })
    .describe("User application preferences"),

  // ---------------------------------------------------------------------------
  additionalNotes: z
    .string()
    .optional()
    .describe(
      "Any additional notes about dietary restrictions, preferences, or health conditions",
    ),

  // ---------------------------------------------------------------------------
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Profile = z.infer<typeof schemaProfileEntity>;
