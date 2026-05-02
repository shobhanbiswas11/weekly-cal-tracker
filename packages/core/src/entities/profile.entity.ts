import z from "zod";

export const schemaProfileEntity = z.object({
  id: z.string(), // this will be the user id

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
