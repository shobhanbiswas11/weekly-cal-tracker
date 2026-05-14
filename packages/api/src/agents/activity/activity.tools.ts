import { schemaActivityEntryEntity, uiFlowActivity } from "@weekly-cal/core";
import { tool } from "ai";
import z from "zod";
import { ActivityService } from "../../services";

const dateSchema = z.iso.date().describe("Date in YYYY-MM-DD format");

export const getActivityTools = (
  activityService: ActivityService,
  userId: string,
) => {
  return {
    // =========================================================================
    // Mutation Tools (UI Flow)
    // =========================================================================
    logActivity: tool({
      description:
        "Tool to log a new activity (e.g., running, walking, cycling, climbing stairs, strength training, etc.)",
      inputSchema: z.object({
        date: schemaActivityEntryEntity.shape.date,
        name: schemaActivityEntryEntity.shape.name,
        caloriesBurned: schemaActivityEntryEntity.shape.caloriesBurned,
        note: schemaActivityEntryEntity.shape.note,
      }),
      execute: ({ date, name, caloriesBurned, note }) => {
        return uiFlowActivity.log.init({
          date,
          name,
          caloriesBurned,
          note,
        });
      },
    }),

    deleteActivityEntry: tool({
      description:
        "Delete an activity entry. Requires user confirmation via UI.",
      inputSchema: z.object({
        activityId: z.string().describe("The ID of the activity to delete"),
        activityName: z
          .string()
          .describe("Name of the activity for confirmation"),
        date: dateSchema.describe("Date of the activity"),
      }),
      execute: ({ activityId, activityName, date }) => {
        return uiFlowActivity.delete.init({
          activityId,
          activityName,
          date,
        });
      },
    }),

    updateActivityEntry: tool({
      description:
        "Update an existing activity entry. Requires user confirmation via UI.",
      inputSchema: z.object({
        activityId: z.string().describe("The ID of the activity to update"),
        date: dateSchema.describe("Date of the activity"),
        activityName: z
          .string()
          .describe("Name of the activity for confirmation"),
        changes: z.array(
          z.object({
            field: z.string().describe("The activity field to update"),
            value: z.string().describe("The new value for the activity field"),
          }),
        ),
      }),
      execute: ({ activityId, date, activityName, changes }) => {
        return uiFlowActivity.update.init({
          activityId,
          date,
          activityName,
          changes,
        });
      },
    }),

    // =========================================================================
    // Query Tools
    // =========================================================================
    getActivitiesByDate: tool({
      description: "Get all activities for a specific date",
      inputSchema: z.object({
        date: dateSchema,
      }),
      execute: ({ date }) => activityService.getByDate(userId, date),
    }),

    getTodaysActivities: tool({
      description: "Get all activities logged today",
      inputSchema: z.object({}),
      execute: () => {
        const today = new Date().toISOString().split("T")[0];
        return activityService.getByDate(userId, today);
      },
    }),

    getActivitiesByDateRange: tool({
      description: "Get all activities within a date range (inclusive)",
      inputSchema: z.object({
        startDate: dateSchema.describe("Start date of the range"),
        endDate: dateSchema.describe("End date of the range"),
      }),
      execute: ({ startDate, endDate }) =>
        activityService.getByDateRange(userId, startDate, endDate),
    }),

    getActivityById: tool({
      description: "Get a specific activity by its ID",
      inputSchema: z.object({
        activityId: z.string().describe("The ID of the activity to retrieve"),
      }),
      execute: ({ activityId }) => activityService.getById(userId, activityId),
    }),
  };
};
