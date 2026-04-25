import { endOfWeek, format, startOfWeek } from "date-fns";
import z from "zod";
import { defineAgent } from "./types";

// =============================================================================
// Primary Agent Definition
// =============================================================================

export function buildPrimaryAgentDateContext(now: Date = new Date()): string {
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

export const agentDefinitionPrimary = defineAgent({
  name: "primary_agent",
  description:
    "Health tracking assistant that helps users log meals, activities, and manage their wellness goals.",
  instructions: `You are a health tracking assistant.

## Behavior
- Be concise
- Ask ONE clarifying question if input is ambiguous
- Use tools to log or retrieve data

${buildPrimaryAgentDateContext()}
`,
  inputSchema: z.object({
    message: z.string().describe("The user's message"),
  }),
});
