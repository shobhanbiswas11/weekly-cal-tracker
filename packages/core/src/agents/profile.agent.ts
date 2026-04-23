import z from "zod";
import { schemaProfileEntity, schemaUpdateProfile } from "../schemas";
import { defineAgent, defineTool } from "./types";

// =============================================================================
// Profile Agent Tool Definitions
// =============================================================================
export const toolGetProfile = defineTool({
  name: "get_profile",
  description:
    "Get the user profile information including personal details, calculated BMR/TDEE, and nutrition targets.",
  inputSchema: z.object({}),
  outputSchema: schemaProfileEntity,
});

export const toolRequestProfileUpdate = defineTool({
  name: "request_profile_update",
  description:
    "Request a profile update. Returns a confirmation request for the user to approve before any changes are made.",
  inputSchema: schemaUpdateProfile,
  outputSchema: z.object({
    action: z.literal("UPDATE_PROFILE"),
    currentValues: schemaProfileEntity.partial().optional(),
    pendingChanges: schemaUpdateProfile,
    message: z
      .string()
      .describe("Human-readable summary of the proposed changes"),
  }),
});

// =============================================================================
// Profile Agent Definition
// =============================================================================
export const agentProfileHandler = defineAgent({
  name: "profile_agent",
  description:
    "Sub-agent for managing user profile information including personal details, fitness goals, and calculated nutrition targets (BMR, TDEE, macros).",
  instructions: `You are a profile management assistant. Your job is to help users:
- View their current profile information
- Update profile details (name, weight, goals, etc.)
- Explain their calculated nutrition values (BMR, TDEE, macro targets)

For any profile updates, always use request_profile_update. This will present a confirmation UI to the user - never execute mutations directly.
`,
  inputSchema: z.object({
    task: z
      .string()
      .describe(
        "The profile-related task to perform, e.g., 'Show my profile', 'Update my weight to 75kg', 'What is my daily calorie target?'",
      ),
  }),
});
