import { z } from "zod";
import { injectable } from "../di-utils";

// =============================================================================
// App Config Schema
// =============================================================================

const appConfigSchema = z.object({
  TABLE_NAME: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  PRIMARY_MODEL_NAME: z.string().optional().default("gpt-5.4-mini"), // gpt-5.4-nano
  ENABLE_DEV_TOOLS: z
    .string()
    .transform((v) => v === "true")
    .optional()
    .default(false),
});

@injectable()
export class AppConfigService {
  private readonly config: z.infer<typeof appConfigSchema>;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.config = appConfigSchema.parse(env);
  }

  get tableName(): string {
    if (!this.config.TABLE_NAME) {
      throw new Error("TABLE_NAME environment variable is required");
    }
    return this.config.TABLE_NAME;
  }

  get openaiApiKey(): string {
    if (!this.config.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for AI features",
      );
    }
    return this.config.OPENAI_API_KEY;
  }

  get primaryModelName(): string {
    return this.config.PRIMARY_MODEL_NAME;
  }

  get enableDevTools(): boolean {
    return this.config.ENABLE_DEV_TOOLS;
  }
}
