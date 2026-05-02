import { z } from "zod";
import { injectable } from "../di-utils";

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

@injectable()
export class AppConfigService {
  readonly tableName: string;
  readonly primaryModelName: string;
  readonly enableDevTools: boolean;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const parsed = appConfigSchema.parse(env);
    this.tableName = parsed.TABLE_NAME;
    this.primaryModelName = parsed.PRIMARY_MODEL_NAME;
    this.enableDevTools = parsed.ENABLE_DEV_TOOLS;
  }
}
