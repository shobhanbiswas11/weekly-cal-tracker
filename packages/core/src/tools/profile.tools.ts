import { z } from "zod";
import {
  schemaCreateProfile,
  schemaUpdateProfile,
} from "../schemas/dtos/create-profile.dto";
import { schemaProfileEntity } from "../schemas/entities/profile.entity";
import { defineTool } from "./types";

// =============================================================================
// Output Schemas
// =============================================================================

export const schemaGetProfileOutput = z.union([
  schemaProfileEntity,
  z.object({ error: z.string() }),
]);

export const schemaCreateProfileOutput = z.object({
  success: z.literal(true),
  message: z.string(),
  profile: schemaProfileEntity,
});

export const schemaUpdateProfileOutput = z.object({
  success: z.literal(true),
  message: z.string(),
  profile: schemaProfileEntity,
});

export const schemaDeleteProfileOutput = z.object({
  success: z.literal(true),
  message: z.string(),
});

// =============================================================================
// Tool Definitions
// =============================================================================

export const toolGetProfile = defineTool({
  name: "get_profile",
  title: "Get Profile",
  description: "Get user's profile with goals and targets",
  inputSchema: z.object({}),
  outputSchema: schemaGetProfileOutput,
  approval: { require: false },
});

export const toolCreateProfile = defineTool({
  name: "create_profile",
  title: "Create Profile",
  description: "Create user profile with calculated nutrition targets",
  inputSchema: schemaCreateProfile,
  outputSchema: schemaCreateProfileOutput,
  approval: { require: true, confirmLabel: "Create", cancelLabel: "Cancel" },
});

export const toolUpdateProfile = defineTool({
  name: "update_profile",
  title: "Update Profile",
  description: "Update user profile",
  inputSchema: schemaUpdateProfile,
  outputSchema: schemaUpdateProfileOutput,
  approval: { require: true, confirmLabel: "Update", cancelLabel: "Cancel" },
});

export const toolDeleteProfile = defineTool({
  name: "delete_profile",
  title: "Delete Profile",
  description: "Delete user profile",
  inputSchema: z.object({}),
  outputSchema: schemaDeleteProfileOutput,
  approval: { require: true, confirmLabel: "Delete", cancelLabel: "Keep" },
});
