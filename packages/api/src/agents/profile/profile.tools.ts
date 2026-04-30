import { uiFlowProfile } from "@weekly-cal/core";
import { tool } from "ai";
import z from "zod";
import { ProfileRepo } from "../../repo/profile.repo.interface";

export const getProfileTools = (profileRepo: ProfileRepo, userId: string) => {
  return {
    getProfile: tool({
      description:
        "Get the user profile information including personal details, calculated BMR/TDEE, and nutrition targets.",
      inputSchema: z.object({
        fields: z
          .array(z.string())
          .describe("List of profile fields to retrieve."),
      }),
      execute: ({ fields }) =>
        profileRepo.getSelectedFieldsByUserId(userId, fields as any),
    }),
    updateProfile: tool({
      description: "Update user profile fields with new values",
      inputSchema: z.object({
        message: z
          .string()
          .describe(
            "Confirmation message to show the user before updating profile",
          ),
        changes: z.array(
          z.object({
            field: z.string().describe("The profile field to update"),
            value: z.string().describe("The new value for the profile field"),
          }),
        ),
      }),
      execute: async ({ changes, message }) => {
        return uiFlowProfile.update.init({
          message,
          changes: changes.reduce(
            (acc, { field, value }) => {
              acc[field] = value;
              return acc;
            },
            {} as Record<string, string>,
          ),
        });
      },
    }),
  };
};
