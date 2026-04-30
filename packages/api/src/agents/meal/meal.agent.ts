import {
  describeSchema,
  isUIFlow,
  schemaMealEntryEntity,
} from "@weekly-cal/core";
import { tool, ToolLoopAgent } from "ai";
import z from "zod";
import {
  AUTH_CONTEXT,
  AuthContext,
  inject,
  injectable,
  MEAL_ENTRY_REPO,
} from "../../di";
import { MealEntryRepo } from "../../repo/meal-entry.repo.interface";
import { hasUIFlowResult } from "../utils";
import { getMealTools } from "./meal.tools";

@injectable()
export class MealAgent {
  constructor(
    private mealRepo: MealEntryRepo = inject(MEAL_ENTRY_REPO),
    private auth: AuthContext = inject(AUTH_CONTEXT),
  ) {}

  /**
   * Creates a standalone ToolLoopAgent for direct use.
   */
  create(model: any) {
    return new ToolLoopAgent({
      model,
      instructions: `You are a meal tracking assistant.
- Use tools if necessary
- The meal is stored as key-value pairs with the following fields and types: ${describeSchema(schemaMealEntryEntity)}.`,
      tools: getMealTools(this.mealRepo, this.auth.userId),
      stopWhen: hasUIFlowResult(),
    });
  }

  /**
   * Creates a tool definition that can be used by a parent agent to delegate
   * meal-related tasks to this agent.
   */
  createTool(model: any) {
    return tool({
      description:
        "Sub Agent to handle anything related to meals. Treat this as a collection of tools. Try to give specific task",
      inputSchema: z.object({
        task: z
          .string()
          .describe(
            "The meal-related task to perform, e.g., 'Log 2 eggs for breakfast', 'What did I eat yesterday?', 'How many calories did I have last week?', 'Delete my lunch entry from today'",
          ),
        context: z
          .string()
          .nullable()
          .describe(
            "Very short summary of previous conversation for the task, Important : Only include if needed",
          ),
      }),
      execute: async ({ task, context }, { abortSignal }) => {
        const agent = this.create(model);

        const result = await agent.generate({
          prompt: `Task: ${task}
Context: ${context ?? "None"}`,
          abortSignal,
        });
        // If sub-agent stopped due to UI flow, propagate it to the parent
        const lastToolResult = result.toolResults?.at(-1)?.output;
        if (isUIFlow(lastToolResult)) {
          return lastToolResult;
        }

        return result.text;
      },
    });
  }
}
