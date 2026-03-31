import { type ToolHandlerContext, type Toolkit } from "@assistant-ui/react";
import { z } from "zod";
import {
  createEntry,
  deleteEntry,
  updateEntry,
  updateProfile,
} from "../../lib/api";

// Schemas for tool parameters
const createFoodEntrySchema = z.object({
  date: z
    .string()
    .optional()
    .describe("Date in YYYY-MM-DD format, defaults to today"),
  name: z.string().describe("Name of the food item"),
  calories: z.number().describe("Estimated calories"),
  protein: z.number().describe("Estimated grams of protein"),
  carbs: z.number().describe("Estimated grams of carbohydrates"),
  fat: z.number().describe("Estimated grams of fat"),
});

const updateFoodEntrySchema = z.object({
  date: z.string().describe("Date of the entry (YYYY-MM-DD)"),
  id: z.string().describe("ID of the entry to update"),
  name: z.string().optional().describe("New name for the food item"),
  calories: z.number().optional().describe("New calorie value"),
  protein: z.number().optional().describe("New protein value in grams"),
  carbs: z.number().optional().describe("New carbs value in grams"),
  fat: z.number().optional().describe("New fat value in grams"),
});

const deleteFoodEntrySchema = z.object({
  date: z.string().describe("Date of the entry (YYYY-MM-DD)"),
  id: z.string().describe("ID of the entry to delete"),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  dateOfBirth: z.string().optional(),
  biologicalSex: z.enum(["male", "female"]).optional(),
  height: z.number().optional(),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  activityLevel: z
    .enum([
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extremely_active",
    ])
    .optional(),
  primaryGoal: z
    .enum([
      "lose_weight",
      "gain_muscle",
      "maintain",
      "body_recomposition",
      "improve_health",
    ])
    .optional(),
});

// Toolkit with frontend tools
export const toolkit: Toolkit = {
  // Create a new food entry
  createFoodEntry: {
    description: "Create a new food entry for calorie tracking",
    parameters: createFoodEntrySchema,
    execute: async (args, ctx: ToolHandlerContext) => {
      try {
        const entry = await createEntry({
          date: args.date || new Date().toISOString().split("T")[0],
          name: args.name,
          calories: Math.round(args.calories),
          protein: Math.round(args.protein),
          carbs: Math.round(args.carbs),
          fat: Math.round(args.fat),
        });

        // Invalidate queries to refresh data
        // Note: In a real app, you'd get the queryClient from context
        // For now, we return success and let the UI refetch
        return {
          success: true,
          message: `Added "${entry.name}" (${entry.calories} kcal)`,
          entry,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create entry",
        };
      }
    },
  },

  // Update an existing food entry
  updateFoodEntry: {
    description: "Update an existing food entry",
    parameters: updateFoodEntrySchema,
    execute: async (args) => {
      try {
        const { date, id, ...updates } = args;
        const entry = await updateEntry(date, id, updates);

        return {
          success: true,
          message: `Updated "${entry.name}"`,
          entry,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update entry",
        };
      }
    },
  },

  // Delete a food entry
  deleteFoodEntry: {
    description: "Delete a food entry",
    parameters: deleteFoodEntrySchema,
    execute: async (args) => {
      try {
        await deleteEntry(args.date, args.id);

        return {
          success: true,
          message: "Entry deleted successfully",
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete entry",
        };
      }
    },
  },

  // Update user profile
  updateProfile: {
    description: "Update user profile information",
    parameters: updateProfileSchema,
    execute: async (args) => {
      try {
        const result = await updateProfile(args);

        return {
          success: true,
          message: "Profile updated successfully",
          profile: result.profile,
        };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update profile",
        };
      }
    },
  },
};
