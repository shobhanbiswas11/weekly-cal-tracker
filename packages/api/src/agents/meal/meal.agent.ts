import { isUIFlow, schemaMealEntryEntity, uiFlow } from "@weekly-cal/core";
import { StopCondition, tool, ToolLoopAgent } from "ai";
import z from "zod";
import { AUTH_CONTEXT, AuthContext, inject, injectable } from "../../di";

function hasUIFlowResult(): StopCondition<any> {
  return ({ steps }) => {
    return steps.some((step) =>
      step.toolResults?.some((result) => isUIFlow(result.output)),
    );
  };
}

@injectable()
export class MealAgent {
  constructor(private auth: AuthContext = inject(AUTH_CONTEXT)) {}

  /**
   * Creates a standalone ToolLoopAgent for direct use.
   */
  create(model: any) {
    return new ToolLoopAgent({
      model,
      instructions: `You are a meal tracking assistant. Use the available tools if needed.`,
      tools: {
        logMeal: tool({
          description: "Tool to log a meal from food items",
          inputSchema: z.object({
            date: schemaMealEntryEntity.shape.date,
            name: schemaMealEntryEntity.shape.name,
            specialNote: schemaMealEntryEntity.shape.note,
            foodItems: z
              .array(
                z.object({
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
                }),
              )
              .describe("Macros should be estimated based on the quantity"),
          }),
          execute: ({ foodItems, name, specialNote, date }) => {
            return uiFlow("LOG_MEAL", {
              state: "initiated",
              date,
              name,
              note: specialNote,
              foodItems,
            });
          },
        }),
      },
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
