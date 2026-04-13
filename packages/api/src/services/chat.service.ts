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
import { endOfWeek, format, startOfWeek } from "date-fns";
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
    // Week boundaries: Monday to Sunday (ISO standard)
    const weekStart = format(
      startOfWeek(now, { weekStartsOn: 1 }),
      "yyyy-MM-dd",
    );
    const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

    return `You are a nutrition tracking assistant.

## Context
- Today: ${today}
- Current week: ${week} (Monday ${weekStart} to Sunday ${weekEnd})

## Behavior
- Be concise. After tool execution or user approval/denial, respond briefly without restating details.
- Estimate nutrition moderately high when foods are clearly described.
- If food type or quantity is ambiguous (e.g., "I had some agoites"), ask ONE clarifying question before logging.
- When user says "what did I eat today/this week", fetch entries first, then summarize.

## Tool Workflows
- **Delete/Update by name**: First call entries_by_date to find the entry, then use the actual ID.
- **Profile data**: Only fetch profile when user asks about goals, progress, or before creating a profile. Don't fetch on every request.
- **Partial updates**: When updating entries, only include fields that need to change.

Mutations require approval.`;
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
      prompt: `Select tools needed for the conversation. If general chat, select none.

## Intent Examples
- "what did I eat today/yesterday" → entries_by_date
- "show this week's meals" → entries_by_calendar_week  
- "delete the biryani I had" → entries_by_date (to find ID first), delete_meal_entry
- "I had pizza for lunch" → log_meal
- "update my weight/goals" → get_profile (if checking existing), update_profile
- "How much calorie left for today?" → entries_by_date (to get today's entries), get_profile (to get calorie goal)
- "how am I doing this week" → entries_by_calendar_week, get_profile (for goals context),

## Rules
- Only include get_profile if user asks about goals/progress or profile-related data
- For delete/update by meal name, include entries_by_date to lookup first

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
