import {
  agentDefinitionProfile,
  isUIFlow,
  toolGetProfile,
} from "@weekly-cal/core";
import { StopCondition, tool, ToolLoopAgent } from "ai";
import {
  AUTH_CONTEXT,
  AuthContext,
  inject,
  injectable,
  PROFILE_REPO,
} from "../di";
import { ProfileRepo } from "../repo/profile.repo.interface";

function hasUIFlowResult(): StopCondition<any> {
  return ({ steps }) => {
    return steps.some((step) =>
      step.toolResults?.some((result) => isUIFlow(result.output)),
    );
  };
}

@injectable()
export class ProfileAgent {
  constructor(
    private profileRepo: ProfileRepo = inject(PROFILE_REPO),
    private auth: AuthContext = inject(AUTH_CONTEXT),
  ) {}

  /**
   * Returns the tools available to this agent.
   */
  private getTools() {
    return {
      [toolGetProfile.name]: tool({
        inputSchema: toolGetProfile.inputSchema,
        description: toolGetProfile.description,
        execute: () => this.profileRepo.getByUserId(this.auth.userId),
      }),
    };
  }

  /**
   * Creates a standalone ToolLoopAgent for direct use.
   */
  create(model: any) {
    return new ToolLoopAgent({
      model,
      instructions: agentDefinitionProfile.instructions,
      tools: this.getTools(),
      stopWhen: hasUIFlowResult(),
    });
  }

  /**
   * Creates a tool definition that can be used by a parent agent to delegate
   * profile-related tasks to this agent.
   */
  createTool(model: any) {
    return tool({
      description: agentDefinitionProfile.description,
      inputSchema: agentDefinitionProfile.inputSchema,
      execute: async (
        { task }: { task: string },
        { abortSignal }: { abortSignal?: AbortSignal },
      ) => {
        const agent = this.create(model);

        const result = await agent.generate({
          prompt: task,
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

  /**
   * Returns the agent name for use as a tool key.
   */
  get name(): string {
    return agentDefinitionProfile.name;
  }
}
