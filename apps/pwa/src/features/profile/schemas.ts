import z from "zod";

// Result type for the profile setup tool - persists user action in the message
export const ProfileResultSchema = z.object({
  action: z.enum(["saved", "canceled"]),
});

export type ProfileResult = z.infer<typeof ProfileResultSchema>;

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
