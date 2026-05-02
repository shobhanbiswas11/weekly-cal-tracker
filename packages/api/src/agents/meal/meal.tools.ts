import { schemaMealEntryEntity, uiFlowMeal } from "@weekly-cal/core";
import { tool } from "ai";
import z from "zod";
import { MealService } from "../../services/meal.service";

const dateSchema = z.iso.date().describe("Date in YYYY-MM-DD format");

const foodItemSchema = z.object({
  name: z.string().describe("Singular Name of the food"),
  quantity: z
    .string()
    .describe(
      "Quantity of the food item, e.g., '2 large', '1 cup', '150g', etc.",
    ),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fats: z.number(),
  fiber: z.number(),
  sugar: z.number(),
  sodium: z.number(),
});

export const getMealTools = (mealService: MealService, userId: string) => {
  return {
    // =========================================================================
    // Mutation Tools (UI Flow)
    // =========================================================================
    logMeal: tool({
      description: "Tool to log a new meal from food items",
      inputSchema: z.object({
        date: schemaMealEntryEntity.shape.date,
        name: schemaMealEntryEntity.shape.name,
        specialNote: schemaMealEntryEntity.shape.note,
        foodItems: z
          .array(foodItemSchema)
          .describe("Macros should be estimated based on the quantity"),
      }),
      execute: ({ foodItems, name, specialNote, date }) => {
        return uiFlowMeal.log.init({
          date,
          name,
          note: specialNote,
          foodItems,
        });
      },
    }),

    // =========================================================================
    // Query Tools
    // =========================================================================
    getMealsByDate: tool({
      description: "Get all meals for a specific date",
      inputSchema: z.object({
        date: dateSchema,
      }),
      execute: ({ date }) => mealService.getByDate(userId, date),
    }),

    getTodaysMeals: tool({
      description: "Get all meals logged today",
      inputSchema: z.object({}),
      execute: () => {
        const today = new Date().toISOString().split("T")[0];
        return mealService.getByDate(userId, today);
      },
    }),

    getMealsByDateRange: tool({
      description: "Get all meals within a date range (inclusive)",
      inputSchema: z.object({
        startDate: dateSchema.describe("Start date of the range"),
        endDate: dateSchema.describe("End date of the range"),
      }),
      execute: ({ startDate, endDate }) =>
        mealService.getByDateRange(userId, startDate, endDate),
    }),

    getMealById: tool({
      description: "Get a specific meal by its ID",
      inputSchema: z.object({
        mealId: z.string().describe("The ID of the meal to retrieve"),
      }),
      execute: ({ mealId }) => mealService.getById(userId, mealId),
    }),

    // =========================================================================
    // Mutation Tools (UI Flow)
    // =========================================================================
    deleteMealEntry: tool({
      description: "Delete a meal entry. Requires user confirmation via UI.",
      inputSchema: z.object({
        mealId: z.string().describe("The ID of the meal to delete"),
        mealName: z.string().describe("Name of the meal for confirmation"),
        date: dateSchema.describe("Date of the meal"),
      }),
      execute: ({ mealId, mealName, date }) => {
        return uiFlowMeal.delete.init({
          mealId,
          mealName,
          date,
        });
      },
    }),

    updateMealEntry: tool({
      description:
        "Update an existing meal entry. Requires user confirmation via UI.",
      inputSchema: z.object({
        mealId: z.string().describe("The ID of the meal to update"),
        date: dateSchema.describe("Date of the meal"),
        mealName: z.string().describe("Name of the meal for confirmation"),
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
      execute: ({ mealId, date, mealName, changes }) => {
        return uiFlowMeal.update.init({
          mealId,
          date,
          mealName,
          changes: changes as any,
        });
      },
    }),
  };
};
