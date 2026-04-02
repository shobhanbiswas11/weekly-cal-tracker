import z from "zod";

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
});
