import { InjectionToken } from "@needle-di/core";
import { z } from "zod";
import type { MealEntryRepo } from "../repo/meal-entry.repo.interface";
import type { ProfileRepo } from "../repo/profile.repo.interface";

// =============================================================================
// Repository Tokens
// =============================================================================

/**
 * Injection token for MealEntryRepo interface.
 * Allows swapping implementations (DynamoDB, InMemory, etc.)
 */
export const MEAL_ENTRY_REPO = new InjectionToken<MealEntryRepo>(
  "MEAL_ENTRY_REPO",
);

/**
 * Injection token for ProfileRepo interface.
 * Allows swapping implementations (DynamoDB, InMemory, etc.)
 */
export const PROFILE_REPO = new InjectionToken<ProfileRepo>("PROFILE_REPO");

// =============================================================================
// Auth Token
// =============================================================================

/**
 * Auth context injected per request.
 * Contains the authenticated user's ID.
 */
export interface AuthContext {
  userId: string;
}

export const AUTH_CONTEXT = new InjectionToken<AuthContext>("AUTH_CONTEXT");

// =============================================================================
// Config Token
// =============================================================================

const appConfigSchema = z.object({
  TABLE_NAME: z.string().min(1, "TABLE_NAME is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  ENABLE_DEV_TOOLS: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

/**
 * Application configuration.
 * Allows easy mocking in tests without stubbing process.env.
 */
export interface AppConfig {
  tableName: string;
  enableDevTools: boolean;
}

/**
 * Creates AppConfig from environment variables.
 * @throws {ZodError} if required env vars are missing or invalid
 */
export function createAppConfig(
  env: NodeJS.ProcessEnv = process.env,
): AppConfig {
  const parsed = appConfigSchema.parse(env);
  return {
    tableName: parsed.TABLE_NAME,
    enableDevTools: parsed.ENABLE_DEV_TOOLS,
  };
}

export const APP_CONFIG = new InjectionToken<AppConfig>("APP_CONFIG");
