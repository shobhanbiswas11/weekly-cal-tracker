import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { inject, injectable } from "@needle-di/core";
import {
  schemaCreateMealEntry,
  schemaCreateProfile,
  schemaUpdateMealEntry,
  schemaUpdateProfile,
} from "@weekly-cal/core";
import {
  convertToModelMessages,
  streamText,
  tool,
  type StreamTextResult,
} from "ai";
import { z } from "zod";
import { AUTH_CONTEXT, MEAL_ENTRY_REPO, PROFILE_REPO } from "./tokens";

// =============================================================================
// System Prompt
// =============================================================================

const SYSTEM_PROMPT = `You are a friendly nutrition assistant for a calorie tracking app. Help users log their meals, answer nutrition questions, and provide encouragement.

## Date Handling
- Today's date is provided in the context
- Calculate relative dates ("yesterday", "last Monday", etc.) from today
- Use ISO format (YYYY-MM-DD) for all date parameters
- If no date is mentioned, default to today

## Meal Logging
When a user describes what they ate:
1. Estimate nutritional values (calories, protein, carbs, fats, fiber, sugar, sodium)
2. Estimate on the MODERATELY higher side when uncertain
3. Consider portion sizes and cooking methods
4. Homemade food typically has fewer calories than restaurant/takeout
5. Call the create_meal_entry tool to log it (user will approve via UI)

## Reading Data
- Use get_entries_by_date to see what user ate on a specific day
- Use get_entries_by_date_range for weekly summaries
- Use get_profile to understand user's goals and targets

## Mutations Require Approval
All create/update/delete operations will pause for user approval before executing.
Be clear about what you're about to do so the user can make an informed decision.`;

// =============================================================================
// Tool Input Schemas
// =============================================================================

const schemaGetEntriesByDate = z.object({
  date: z.string().describe("Date in ISO format (YYYY-MM-DD)"),
});

const schemaGetEntriesByDateRange = z.object({
  startDate: z.string().describe("Start date in ISO format (YYYY-MM-DD)"),
  endDate: z
    .string()
    .optional()
    .describe("End date in ISO format (YYYY-MM-DD). Defaults to startDate if omitted."),
});

const schemaGetEntryById = z.object({
  id: z.string().describe("The unique ID of the meal entry"),
});

const schemaUpdateMealEntryInput = schemaUpdateMealEntry.extend({
  id: z.string().describe("The unique ID of the meal entry to update"),
});

const schemaDeleteMealEntry = z.object({
  id: z.string().describe("The unique ID of the meal entry to delete"),
});

// =============================================================================
// ChatService
// =============================================================================

@injectable()
export class ChatService {
  constructor(
    private mealEntryRepo = inject(MEAL_ENTRY_REPO),
    private profileRepo = inject(PROFILE_REPO),
    private auth = inject(AUTH_CONTEXT),
  ) {}

  /**
   * Stream a chat response with AI-powered tool calling.
   * All repository operations are available as tools.
   */
  async streamChat(
    messages: any,
    frontendToolDefs: any,
  ): Promise<StreamTextResult<any, any>> {
    const userId = this.auth.userId;

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      tools: {
        // Include any frontend-defined tools
        ...frontendTools(frontendToolDefs),

        // =====================================================================
        // Meal Entry Query Tools (no approval)
        // =====================================================================

        get_entries_by_date: tool({
          description:
            "Get all meal entries for a specific date. Use this to see what the user ate on a given day.",
          inputSchema: schemaGetEntriesByDate,
          execute: async ({ date }) => {
            const entries = await this.mealEntryRepo.getByDate(userId, date);
            return {
              date,
              entries,
              totalCalories: entries.reduce((sum, e) => sum + (e.calories || 0), 0),
              totalProtein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
              totalCarbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
              totalFats: entries.reduce((sum, e) => sum + (e.fats || 0), 0),
            };
          },
        }),

        get_entries_by_date_range: tool({
          description:
            "Get all meal entries within a date range. Use this for weekly summaries or historical analysis.",
          inputSchema: schemaGetEntriesByDateRange,
          execute: async ({ startDate, endDate }) => {
            const entries = await this.mealEntryRepo.getByDateRange(
              userId,
              startDate,
              endDate,
            );
            return {
              startDate,
              endDate: endDate ?? startDate,
              entries,
              totalCalories: entries.reduce((sum, e) => sum + (e.calories || 0), 0),
              totalProtein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
              totalCarbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
              totalFats: entries.reduce((sum, e) => sum + (e.fats || 0), 0),
            };
          },
        }),

        get_entry_by_id: tool({
          description:
            "Get a specific meal entry by its ID. Use this when the user refers to a specific entry.",
          inputSchema: schemaGetEntryById,
          execute: async ({ id }) => {
            const entry = await this.mealEntryRepo.getById(userId, id);
            if (!entry) {
              return { error: `Meal entry not found: ${id}` };
            }
            return entry;
          },
        }),

        // =====================================================================
        // Meal Entry Mutation Tools (require approval)
        // =====================================================================

        create_meal_entry: tool({
          description: `Create a new meal entry. Use this when the user wants to log food they ate.

IMPORTANT: Estimate nutritional values based on the user's description:
- calories: Total kilocalories
- protein: Grams of protein
- carbs: Grams of carbohydrates
- fats: Grams of fat
- fiber: Grams of fiber (optional)
- sugar: Grams of sugar (optional)
- sodium: Milligrams of sodium (optional)

Estimate on the moderately higher side when uncertain.`,
          inputSchema: schemaCreateMealEntry,
          execute: async (data) => {
            const entry = await this.mealEntryRepo.create(userId, data);
            return {
              success: true,
              message: `Logged ${entry.name} (${entry.calories} kcal)`,
              entry,
            };
          },
          needsApproval: true,
        }),

        update_meal_entry: tool({
          description:
            "Update an existing meal entry. Use this when the user wants to correct or modify a logged meal.",
          inputSchema: schemaUpdateMealEntryInput,
          execute: async ({ id, ...data }) => {
            const entry = await this.mealEntryRepo.update(userId, id, data);
            return {
              success: true,
              message: `Updated ${entry.name}`,
              entry,
            };
          },
          needsApproval: true,
        }),

        delete_meal_entry: tool({
          description:
            "Delete a meal entry. Use this when the user wants to remove a logged meal.",
          inputSchema: schemaDeleteMealEntry,
          execute: async ({ id }) => {
            // Get entry first for confirmation message
            const entry = await this.mealEntryRepo.getById(userId, id);
            if (!entry) {
              return { success: false, error: `Meal entry not found: ${id}` };
            }

            await this.mealEntryRepo.delete(userId, id);
            return {
              success: true,
              message: `Deleted ${entry.name} (${entry.calories} kcal)`,
              deletedEntry: entry,
            };
          },
          needsApproval: true,
        }),

        // =====================================================================
        // Profile Query Tools (no approval)
        // =====================================================================

        get_profile: tool({
          description:
            "Get the user's profile including their goals, targets, and calculated values (TDEE, BMR, macro targets).",
          inputSchema: z.object({}),
          execute: async () => {
            const profile = await this.profileRepo.getByUserId(userId);
            if (!profile) {
              return {
                error: "No profile found. User needs to set up their profile first.",
              };
            }
            return profile;
          },
        }),

        // =====================================================================
        // Profile Mutation Tools (require approval)
        // =====================================================================

        create_profile: tool({
          description: `Create the user's profile with personal information and calculated nutrition targets.

You must calculate these values based on user input:
- BMR using Mifflin-St Jeor formula
- TDEE = BMR × activity multiplier
- Daily calorie target based on goal (deficit for weight loss, surplus for muscle gain)
- Macro targets (protein, carbs, fat in grams)`,
          inputSchema: schemaCreateProfile,
          execute: async (data) => {
            const profile = await this.profileRepo.create(userId, data);
            return {
              success: true,
              message: "Profile created successfully",
              profile,
            };
          },
          needsApproval: true,
        }),

        update_profile: tool({
          description:
            "Update the user's profile. Use this when the user wants to change their goals, weight, or other profile information.",
          inputSchema: schemaUpdateProfile,
          execute: async (data) => {
            const profile = await this.profileRepo.update(userId, data);
            return {
              success: true,
              message: "Profile updated successfully",
              profile,
            };
          },
          needsApproval: true,
        }),

        delete_profile: tool({
          description:
            "Delete the user's profile. Use this only when explicitly requested. This is a destructive action.",
          inputSchema: z.object({}),
          execute: async () => {
            await this.profileRepo.delete(userId);
            return {
              success: true,
              message: "Profile deleted successfully",
            };
          },
          needsApproval: true,
        }),
      },
      messages: await convertToModelMessages(messages),
    });

    return result;
  }
}
