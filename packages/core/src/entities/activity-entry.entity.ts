import z from "zod";

export const schemaActivityEntryEntity = z.object({
  id: z.string(),
  date: z.iso.date().describe("Date of the activity in YYYY-MM-DD format"),
  name: z
    .string()
    .describe(
      "Short name of the activity, e.g., 'Running', 'Cycling', 'Swimming', etc. Important: Only should describe the activity",
    ),
  caloriesBurned: z.number().min(0).describe("Total calories burned in kcal"),
  note: z
    .string()
    .nullable()
    .describe(
      "Additional short notes only specific to the activity, e.g., 'Felt tired', 'High intensity', 'Outdoor run' etc. Don't put random stuff",
    ),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type ActivityEntry = z.infer<typeof schemaActivityEntryEntity>;
