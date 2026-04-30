import { ModelMessage, ToolLoopAgent } from "ai";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { inject, injectable } from "../di";
import { MealAgent } from "./meal";
import { ProfileAgent } from "./profile";
import { hasUIFlowResult } from "./utils";

// =============================================================================
// Primary Agent Definition
// =============================================================================

@injectable()
export class PrimaryAgent {
  private static readonly AGENT_NAME = "primary_agent";

  constructor(
    private profileAgent = inject(ProfileAgent),
    private mealAgent = inject(MealAgent),
  ) {}

  /**
   * Builds the complete system instructions for the agent.
   */
  private buildInstructions(frontendInstructions?: string): string {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const dayOfWeek = format(now, "EEEE");
    const month = format(now, "MMMM yyyy");
    const week = format(now, "RRRR-'W'II");
    const weekStart = format(
      startOfWeek(now, { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    );
    const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

    return `You are a health tracking assistant.

## Behavior
- Be concise
- Ask ONE clarifying question if input is ambiguous
- Use tools to log or retrieve data

## Current Date Context
- Today: ${dayOfWeek}, ${today}
- Month: ${month}
- Week: ${week} (Monday ${weekStart} to Sunday ${weekEnd})
${frontendInstructions ? `\n${frontendInstructions}` : ""}`;
  }

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
    return new ToolLoopAgent({
      model,
      instructions: this.buildInstructions(frontendInstructions),
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
    return PrimaryAgent.AGENT_NAME;
  }
}
