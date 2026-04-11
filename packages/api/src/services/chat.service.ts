import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";

import { toolDefinitionRegistry, type ToolName } from "@weekly-cal/core";
import {
  convertToModelMessages,
  generateText,
  Output,
  stepCountIs,
  streamText,
  UIMessage,
  wrapLanguageModel,
  type StreamTextResult,
} from "ai";
import { format } from "date-fns";
import { z } from "zod";
import { APP_CONFIG, inject, injectable, type AppConfig } from "../di";
import { ToolRegistry } from "../tools";

// =============================================================================
// Tool Selection Schema
// =============================================================================

const TOOL_NAMES = Object.keys(toolDefinitionRegistry) as ToolName[];

const toolSelectionSchema = z.object({
  tools: z.array(z.enum(TOOL_NAMES as [string, ...string[]])),
});

const primaryBaseModel = openai("gpt-5.4-nano");
const classifierBaseModel = openai("gpt-5.4-mini");

// =============================================================================
// ChatService
// =============================================================================

@injectable()
export class ChatService {
  private primaryModel: ReturnType<typeof openai> | null = null;
  private classifierModel: ReturnType<typeof openai> | null = null;
  private modelsInitialized = false;

  constructor(
    private toolRegistry = inject(ToolRegistry),
    private config: AppConfig = inject(APP_CONFIG),
  ) {}

  /**
   * Generate the system prompt with current date and calendar week.
   */
  private getSystemPrompt(): string {
    const now = new Date();
    const today = format(now, "yyyy-MM-dd");
    const week = format(now, "RRRR-'W'II");
    return `Nutrition assistant. Today: ${today}. Week: ${week}. Estimate nutrition on the moderately higher side. Mutations require approval. Be concise.`;
  }

  /**
   * Lazily initialize models. Uses dynamic import for devtools to avoid
   * loading it in Lambda where it tries to create directories.
   */
  private async ensureModelsInitialized(): Promise<void> {
    if (this.modelsInitialized) return;

    if (this.config.enableDevTools) {
      const { devToolsMiddleware } = await import("@ai-sdk/devtools");
      this.primaryModel = wrapLanguageModel({
        model: primaryBaseModel,
        middleware: devToolsMiddleware(),
      });
      this.classifierModel = wrapLanguageModel({
        model: classifierBaseModel,
        middleware: devToolsMiddleware(),
      });
    } else {
      this.primaryModel = primaryBaseModel;
      this.classifierModel = classifierBaseModel;
    }

    this.modelsInitialized = true;
  }

  /**
   * Extract text content from a message's parts.
   */
  private extractMessageText(message: UIMessage): string {
    return message.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ");
  }

  /**
   * Build conversation context string from recent messages.
   */
  private buildConversationContext(
    messages: UIMessage[],
    maxMessages = 6,
  ): string {
    const recentMessages = messages.slice(-maxMessages);
    return recentMessages
      .map((msg) => {
        const text = this.extractMessageText(msg);
        return `${msg.role.toUpperCase()}: ${text}`;
      })
      .join("\n");
  }

  /**
   * Select tools based on conversation context.
   */
  private async selectTools(messages: UIMessage[]): Promise<ToolName[]> {
    const conversationContext = this.buildConversationContext(messages);
    const toolMetadata = this.toolRegistry.getToolMetadata();

    const toolList = toolMetadata
      .map(({ name, description }) => `- ${name}: ${description}`)
      .join("\n");

    const { output } = await generateText({
      model: this.classifierModel!,
      output: Output.object({
        schema: toolSelectionSchema,
      }),
      prompt: `Based on the conversation, select which tools the assistant might need. Only select tools that are relevant to what the user is asking for. If the request is general conversation, select no tools.

Available tools:
${toolList}

Conversation:
${conversationContext}

Which tools are needed?`,
    });

    return (output?.tools as ToolName[]) ?? [];
  }

  /**
   * Stream a chat response with dynamic tool selection.
   */
  async streamChat(
    messages: UIMessage[],
    frontendToolDefs: any,
  ): Promise<StreamTextResult<any, any>> {
    await this.ensureModelsInitialized();

    const selectedToolNames = await this.selectTools(messages);

    const tools: Record<string, any> = {
      ...frontendTools(frontendToolDefs),
      ...this.toolRegistry.createTools(selectedToolNames),
    };

    return streamText({
      model: this.primaryModel!,
      system: this.getSystemPrompt(),
      tools,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
    });
  }
}
