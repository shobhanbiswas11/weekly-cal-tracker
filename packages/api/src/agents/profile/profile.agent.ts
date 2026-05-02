import {
  describeSchema,
  isUIFlow,
  schemaProfileEntity,
} from "@weekly-cal/core";
import { tool, ToolLoopAgent } from "ai";
import z from "zod";
import { inject, injectable } from "../../di-utils";
import { AuthService, ProfileService } from "../../services";
import { hasUIFlowResult } from "../utils";
import { getProfileTools } from "./profile.tools";

@injectable()
export class ProfileAgent {
  constructor(
    private profileService: ProfileService = inject(ProfileService),
    private auth = inject(AuthService),
  ) {}

  /**
   * Creates a standalone ToolLoopAgent for direct use.
   */
  create(model: any) {
    return new ToolLoopAgent({
      model,
      instructions: `You are a profile management assistant.
- Use tools if necessary
- The profile is stored as key-value pairs with the following fields and types: ${describeSchema(schemaProfileEntity)}.
`,
      tools: getProfileTools(this.profileService, this.auth.userId),
      stopWhen: hasUIFlowResult(),
    });
  }

  /**
   * Creates a tool definition that can be used by a parent agent to delegate
   * profile-related tasks to this agent.
   */
  createTool(model: any) {
    return tool({
      description:
        "Sub-agent for managing user profile. Use ONLY when: (1) user wants to UPDATE profile values, OR (2) user needs detailed info NOT in dynamic context (e.g., BMR, TDEE, weight, height, activity level). Do NOT use for daily calorie/macro targets - those are already in dynamic context.",
      inputSchema: z.object({
        task: z
          .string()
          .describe(
            "The profile-related task to perform, e.g., 'What's my current weight?', 'Update my weight to 75kg', 'What is my daily calorie target?'",
          ),
        context: z
          .string()
          .nullable()
          .describe(
            "Very short summary of previous conversation for the task, if needed",
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
