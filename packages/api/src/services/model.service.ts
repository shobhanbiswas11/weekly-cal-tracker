import { openai } from "@ai-sdk/openai";
import { wrapLanguageModel } from "ai";
import { inject, injectable } from "../di-utils";
import { AppConfigService } from "./app-config.service";

export type Model = ReturnType<typeof openai>;

@injectable()
export class ModelService {
  private primaryModel: Model | null = null;
  private initialized = false;

  constructor(private config = inject(AppConfigService)) {}

  private async wrapWithDevTools(model: Model): Promise<Model> {
    const { devToolsMiddleware } = await import("@ai-sdk/devtools");
    return wrapLanguageModel({
      model,
      middleware: devToolsMiddleware(),
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    const baseModel = openai(this.config.primaryModelName);

    this.primaryModel = this.config.enableDevTools
      ? await this.wrapWithDevTools(baseModel)
      : baseModel;

    this.initialized = true;
  }

  /**
   * Returns the primary model, initializing if needed.
   */
  async getPrimary(): Promise<Model> {
    await this.ensureInitialized();
    return this.primaryModel!;
  }
}
