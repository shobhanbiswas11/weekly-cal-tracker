import {
  dateContext,
  describeSchema,
  isUIFlow,
  schemaActivityEntryEntity,
} from "@weekly-cal/core";
import { tool, ToolLoopAgent } from "ai";
import z from "zod";
import { inject, injectable } from "../../di-utils";
import { ActivityService, AuthService } from "../../services";
import { hasUIFlowResult } from "../utils";
import { getActivityTools } from "./activity.tools";

@injectable()
export class ActivityAgent {
  constructor(
    private activityService: ActivityService = inject(ActivityService),
    private auth = inject(AuthService),
  ) {}

  /**
   * Creates a standalone ToolLoopAgent for direct use.
   */
  create(model: any) {
    return new ToolLoopAgent({
      model,
      instructions: `You are an activity tracking assistant.
- Use tools if necessary
- The activity is stored as key-value pairs with the following fields and types: ${describeSchema(schemaActivityEntryEntity)}.
- Activities can be anything: running, walking, cycling, swimming, climbing stairs, strength training, yoga, etc.
- Estimate calories burned based on the activity type, duration, and intensity when the user provides those details.
${dateContext()}
`,
      tools: getActivityTools(this.activityService, this.auth.userId),
      stopWhen: hasUIFlowResult(),
    });
  }

  /**
   * Creates a tool definition that can be used by a parent agent to delegate
   * activity-related tasks to this agent.
   */
  createTool(model: any) {
    return tool({
      description:
        "Sub Agent to handle anything related to activities/exercises. Treat this as a collection of tools. Try to give specific task",
      inputSchema: z.object({
        task: z
          .string()
          .describe(
            "The activity-related task to perform, e.g., 'Log a 30 min run burning 300 calories', 'What activities did I do today?', 'Delete my morning walk', 'Update my run to 400 calories burned'",
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
