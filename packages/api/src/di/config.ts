import { z } from "zod";

// =============================================================================
// App Config Schema
// =============================================================================

const appConfigSchema = z.object({
  TABLE_NAME: z.string().min(1, "TABLE_NAME is required"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  PRIMARY_MODEL_NAME: z.string().optional().default("gpt-5.4-nano"), // gpt-5.4-nano
  ENABLE_DEV_TOOLS: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

// =============================================================================
// App Config Interface
// =============================================================================

/**
 * Application configuration.
 * Allows easy mocking in tests without stubbing process.env.
 */
export interface AppConfig {
  tableName: string;
  primaryModelName: string;
  enableDevTools: boolean;
}

// =============================================================================
// App Config Factory
// =============================================================================

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
    primaryModelName: parsed.PRIMARY_MODEL_NAME,
    enableDevTools: parsed.ENABLE_DEV_TOOLS,
  };
}
