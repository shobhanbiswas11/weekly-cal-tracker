import { isUIFlow } from "@weekly-cal/core";
import { ModelMessage, StopCondition, ToolLoopAgent } from "ai";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { inject, injectable } from "../di";
import { MealAgent } from "./meal";
import { ProfileAgent } from "./profile";

// =============================================================================
// Primary Agent Definition
// =============================================================================

function buildPrimaryAgentDateContext(now: Date = new Date()): string {
  const today = format(now, "yyyy-MM-dd");
  const dayOfWeek = format(now, "EEEE");
  const month = format(now, "MMMM yyyy");
  const week = format(now, "RRRR-'W'II");
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

  return `## Current Date Context
- Today: ${dayOfWeek}, ${today}
- Month: ${month}
- Week: ${week} (Monday ${weekStart} to Sunday ${weekEnd})`;
}

const AGENT_NAME = "primary_agent";

const AGENT_INSTRUCTIONS = `You are a health tracking assistant.

## Behavior
- Be concise
- Ask ONE clarifying question if input is ambiguous
- Use tools to log or retrieve data

${buildPrimaryAgentDateContext()}
`;

function hasUIFlowResult(): StopCondition<any> {
  return ({ steps }) => {
    return steps.some((step) =>
      step.toolResults?.some((result) => isUIFlow(result.output)),
    );
  };
}

@injectable()
export class PrimaryAgent {
  constructor(
    private profileAgent = inject(ProfileAgent),
    private mealAgent = inject(MealAgent),
  ) {}

  /**
   * Returns the tools available to this agent.
   */
  private getTools(model: any, frontendTools: Record<string, any> = {}) {
    return {
      ...frontendTools,
      profileAgent: this.profileAgent.createTool(model),
      mealAgent: this.mealAgent.createTool(model),
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
      ? `${AGENT_INSTRUCTIONS}\n\n${frontendInstructions}`
      : AGENT_INSTRUCTIONS;

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
    messages: ModelMessage[],
    frontendTools: Record<string, any> = {},
    frontendInstructions?: string,
  ) {
    const agent = this.create(model, frontendTools, frontendInstructions);

    return agent.stream({
      messages,
    });
  }

  /**
   * Returns the agent name.
   */
  get name(): string {
    return AGENT_NAME;
  }
}
