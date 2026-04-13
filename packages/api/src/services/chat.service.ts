import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";

import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  UIMessage,
  wrapLanguageModel,
  type StreamTextResult,
} from "ai";
import { APP_CONFIG, inject, injectable, type AppConfig } from "../di";
import { ToolRegistry } from "../tools";

const primaryBaseModel = openai("gpt-5.4-nano");

// =============================================================================
// ChatService
// =============================================================================

@injectable()
export class ChatService {
  private primaryModel: ReturnType<typeof openai> | null = null;
  private modelsInitialized = false;

  constructor(
    private config: AppConfig = inject(APP_CONFIG),
    private toolRegistry = inject(ToolRegistry),
  ) {}

  private async ensureModelsInitialized(): Promise<void> {
    if (this.modelsInitialized) return;

    if (this.config.enableDevTools) {
      const { devToolsMiddleware } = await import("@ai-sdk/devtools");
      this.primaryModel = wrapLanguageModel({
        model: primaryBaseModel,
        middleware: devToolsMiddleware(),
      });
    } else {
      this.primaryModel = primaryBaseModel;
    }

    this.modelsInitialized = true;
  }

  async streamChat(
    messages: UIMessage[],
    frontendToolDefs: any,
    system?: string,
  ): Promise<StreamTextResult<any, any>> {
    await this.ensureModelsInitialized();

    const tools: Record<string, any> = {
      ...frontendTools(frontendToolDefs),
      ...this.toolRegistry.createTools([
        "get_meal_entries_by_date",
        "get_meal_entries_by_week",
      ]),
    };

    return streamText({
      model: this.primaryModel!,
      system,
      tools,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
    });
  }
}
