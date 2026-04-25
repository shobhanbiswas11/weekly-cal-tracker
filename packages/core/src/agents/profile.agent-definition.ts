import z from "zod";
import { schemaProfileEntity } from "../schemas";
import { describeSchema } from "../utils";
import { defineAgent, defineTool } from "./types";

// =============================================================================
// Profile Agent Tool Definitions
// =============================================================================
export const toolGetProfile = defineTool({
  name: "get_profile",
  description:
    "Get the user profile information including personal details, calculated BMR/TDEE, and nutrition targets.",
  inputSchema: z.object({}),
});

// =============================================================================
// Profile Agent Definition
// =============================================================================

export const agentDefinitionProfile = defineAgent({
  name: "profile_agent",
  description:
    "Sub-agent for managing user profile. Use ONLY when: (1) user wants to UPDATE profile values, OR (2) user needs detailed info NOT in dynamic context (e.g., BMR, TDEE, weight, height, activity level). Do NOT use for daily calorie/macro targets - those are already in dynamic context.",
  instructions: `You are a profile management assistant. Your job is to help users:
- Use tools if necessary
- The profile is stored as key-value pairs with the following fields and types: ${describeSchema(schemaProfileEntity)}.
`,
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
});
