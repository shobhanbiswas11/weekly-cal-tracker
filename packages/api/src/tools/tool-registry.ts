import {
  toolDefinitionRegistry,
  ToolExecutorRegistry,
  type ToolDefinition,
  type ToolName,
} from "@weekly-cal/core";
import { tool } from "ai";
import { endOfISOWeek, format, parse, startOfISOWeek } from "date-fns";
import { AUTH_CONTEXT, inject, injectable, MEAL_ENTRY_REPO } from "../di";
import type { MealEntry } from "../repo/meal-entry.repo.interface";

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

@injectable()
export class ToolRegistry {
  constructor(
    private mealEntryRepo = inject(MEAL_ENTRY_REPO),
    private auth = inject(AUTH_CONTEXT),
  ) {}

  private get executorRegistry(): ToolExecutorRegistry {
    const userId = this.auth.userId;

    const toCompact = (entries: MealEntry[]) =>
      entries.map((e) => ({
        id: e.id,
        n: e.name,
        nt: e.note ?? null,
        d: e.date,
        cal: e.calories,
        P: e.protein,
        C: e.carbs,
        F: e.fats,
      }));

    return {
      get_meal_entries_by_date: async ({ date }) => {
        const entries = await this.mealEntryRepo.getByDate(userId, date);
        return { success: true, data: toCompact(entries) };
      },
      get_meal_entries_by_week: async ({ week }) => {
        const { startDate, endDate } = getWeekDateRange(week);
        const entries = await this.mealEntryRepo.getByDateRange(
          userId,
          startDate,
          endDate,
        );
        return { success: true, data: toCompact(entries) };
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
