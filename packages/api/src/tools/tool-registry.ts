import {
  toolDefinitionRegistry,
  ToolExecutorRegistry,
  type FoodItem,
  type LogMealInput,
  type ToolDefinition,
  type ToolName,
} from "@weekly-cal/core";
import { tool } from "ai";
import { endOfISOWeek, format, parse, startOfISOWeek } from "date-fns";
import {
  AUTH_CONTEXT,
  inject,
  injectable,
  MEAL_ENTRY_REPO,
  PROFILE_REPO,
} from "../di";

function getWeekDateRange(weekStr: string): {
  startDate: string;
  endDate: string;
} {
  const date = parse(weekStr, "RRRR-'W'II", new Date());
  return {
    startDate: format(startOfISOWeek(date), "yyyy-MM-dd"),
    endDate: format(endOfISOWeek(date), "yyyy-MM-dd"),
  };
}

/** Calculate total macros from food items */
function calculateTotals(foods: FoodItem[]) {
  return foods.reduce(
    (acc, food) => ({
      calories: acc.calories + food.calories,
      protein: acc.protein + food.protein,
      carbs: acc.carbs + food.carbs,
      fats: acc.fats + food.fats,
      fiber: food.fiber != null ? (acc.fiber ?? 0) + food.fiber : acc.fiber,
      sugar: food.sugar != null ? (acc.sugar ?? 0) + food.sugar : acc.sugar,
      sodium:
        food.sodium != null ? (acc.sodium ?? 0) + food.sodium : acc.sodium,
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: null as number | null,
      sugar: null as number | null,
      sodium: null as number | null,
    },
  );
}

/** Generate note from food items and optional user note */
function generateNote(foods: FoodItem[], userNote?: string | null): string {
  const foodDescriptions = foods
    .map((f) => `${f.emoji} ${f.name} (${f.quantity})`)
    .join(", ");
  return userNote ? `${foodDescriptions}\n\n${userNote}` : foodDescriptions;
}

@injectable()
export class ToolRegistry {
  constructor(
    private mealEntryRepo = inject(MEAL_ENTRY_REPO),
    private profileRepo = inject(PROFILE_REPO),
    private auth = inject(AUTH_CONTEXT),
  ) {}

  private get executorRegistry(): ToolExecutorRegistry {
    const userId = this.auth.userId;
    return {
      // -----------------------------------------------------------------------
      // Meal Entry Tools
      // -----------------------------------------------------------------------
      log_meal: async (input: LogMealInput) => {
        const { name, foodItems, date, note: userNote } = input;
        const totals = calculateTotals(foodItems);
        const note = generateNote(foodItems, userNote);

        const entryData = {
          date: date ?? format(new Date(), "yyyy-MM-dd"),
          name,
          ...totals,
          note,
        };

        const entry = await this.mealEntryRepo.create(userId, entryData);
        return {
          success: true,
          message: `Logged ${entry.name} (${entry.calories} kcal)`,
          data: entry,
        };
      },

      update_meal_entry: async ({ id, ...data }: any) => {
        const entry = await this.mealEntryRepo.update(userId, id, data);
        return {
          success: true,
          message: `Updated ${entry.name}`,
          data: entry,
        };
      },

      delete_meal_entry: async ({ id }: any) => {
        const entry = await this.mealEntryRepo.getById(userId, id);
        if (!entry) {
          return { success: false, message: `Entry not found: ${id}` };
        }
        await this.mealEntryRepo.delete(userId, id);
        return {
          success: true,
          message: `Deleted ${entry.name}`,
          data: entry,
        };
      },

      get_meal_entry: async ({ id }: any) => {
        const entry = await this.mealEntryRepo.getById(userId, id);
        if (!entry) {
          return { success: false, message: `Entry not found: ${id}` };
        }
        return { success: true, data: entry };
      },

      entries_by_date: async ({ date }: any) => {
        const entries = await this.mealEntryRepo.getByDate(userId, date);
        return { success: true, data: entries };
      },

      entries_by_calendar_week: async ({ week }: any) => {
        const { startDate, endDate } = getWeekDateRange(week);
        const entries = await this.mealEntryRepo.getByDateRange(
          userId,
          startDate,
          endDate,
        );
        return { success: true, data: entries };
      },

      // -----------------------------------------------------------------------
      // Profile Tools
      // -----------------------------------------------------------------------
      create_profile: async (input: any) => {
        const profile = await this.profileRepo.create(userId, input);
        return {
          success: true,
          message: "Profile created",
          data: profile,
        };
      },

      update_profile: async (input: any) => {
        const profile = await this.profileRepo.update(userId, input);
        return {
          success: true,
          message: "Profile updated",
          data: profile,
        };
      },

      get_profile: async () => {
        const profile = await this.profileRepo.getByUserId(userId);
        if (!profile) {
          return { success: false, message: "No profile found" };
        }
        return { success: true, data: profile };
      },

      delete_profile: async () => {
        await this.profileRepo.delete(userId);
        return { success: true, message: "Profile deleted" };
      },
    };
  }

  /**
   * Create an AI SDK tool from a definition with try-catch error handling.
   */
  private createAiTool(definition: ToolDefinition, executor: any) {
    return tool({
      description: definition.description,
      inputSchema: definition.inputSchema,
      execute: async (input) => {
        try {
          const result = await executor(input);
          return definition.outputSchema
            ? definition.outputSchema.parse(result)
            : result;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error occurred";
          return { success: false, message };
        }
      },
      ...(definition.approval?.require && {
        needsApproval: true,
      }),
    });
  }

  /**
   * Create AI SDK compatible tools for the given tool names.
   */
  createTools(names: ToolName[]): Record<string, any> {
    const executors = this.executorRegistry;
    const tools: Record<string, any> = {};

    for (const name of names) {
      const definition = toolDefinitionRegistry[name];
      const executor = executors[name];
      tools[name] = this.createAiTool(definition, executor);
    }

    return tools;
  }

  /**
   * Create all available tools.
   */
  createAllTools(): Record<string, any> {
    const allNames = Object.keys(toolDefinitionRegistry) as ToolName[];
    return this.createTools(allNames);
  }

  /**
   * Get tool definitions for selection/classification purposes.
   */
  getToolMetadata(): { name: ToolName; description: string }[] {
    return (Object.keys(toolDefinitionRegistry) as ToolName[]).map((name) => ({
      name,
      description: toolDefinitionRegistry[name].description,
    }));
  }
}
