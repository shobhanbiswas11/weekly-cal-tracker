import { agentDefinitionPrimary, isUIFlow } from "@weekly-cal/core";
import { ModelMessage, StopCondition, ToolLoopAgent, UIMessage } from "ai";
import { inject, injectable } from "../di";
import { ProfileAgent } from "./profile.agent";

function hasUIFlowResult(): StopCondition<any> {
  return ({ steps }) => {
    return steps.some((step) =>
      step.toolResults?.some((result) => isUIFlow(result.output)),
    );
  };
}

@injectable()
export class PrimaryAgent {
  constructor(private profileAgent = inject(ProfileAgent)) {}

  /**
   * Returns the tools available to this agent.
   */
  private getTools(model: any, frontendTools: Record<string, any> = {}) {
    return {
      ...frontendTools,
      [this.profileAgent.name]: this.profileAgent.createTool(model),
    };
  }

  /**
   * Creates a standalone ToolLoopAgent for direct use.
   */
  create(
    model: any,
    frontendTools: Record<string, any> = {},
    frontendInstructions?: string,
  ) {
    const instructions = frontendInstructions
      ? `${agentDefinitionPrimary.instructions}\n\n${frontendInstructions}`
      : agentDefinitionPrimary.instructions;

    return new ToolLoopAgent({
      model,
      instructions,
      tools: this.getTools(model, frontendTools),
      stopWhen: hasUIFlowResult(),
    });
  }

  /**
   * Streams a response for the given messages.
   */
  stream(
    model: any,
    messages: UIMessage[] | ModelMessage[],
    frontendTools: Record<string, any> = {},
    frontendInstructions?: string,
  ) {
    const agent = this.create(model, frontendTools, frontendInstructions);
    return agent.stream({
      messages: messages as ModelMessage[],
    });
  }

  /**
   * Returns the agent name.
   */
  get name(): string {
    return agentDefinitionPrimary.name;
  }
}
