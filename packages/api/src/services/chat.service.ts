import { devToolsMiddleware } from "@ai-sdk/devtools";
import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";

import { toolRegistry, type ToolDefinition } from "@weekly-cal/core";
import {
  convertToModelMessages,
  generateText,
  Output,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
  wrapLanguageModel,
  type StreamTextResult,
} from "ai";
import { z } from "zod";
import {
  AUTH_CONTEXT,
  inject,
  injectable,
  MEAL_ENTRY_REPO,
  PROFILE_REPO,
} from "../di";

// =============================================================================
// Intent Types & Schemas
// =============================================================================

const INTENTS = [
  "log_meal",
  "query_entries",
  "modify_entry",
  "profile",
  "general",
] as const;
type Intent = (typeof INTENTS)[number];

const intentSchema = z.object({
  intent: z.enum(INTENTS),
});

// =============================================================================
// System Prompts by Intent
// =============================================================================

const today = () => new Date().toISOString().split("T")[0];

const SYSTEM_PROMPTS: Record<Intent, string> = {
  log_meal: `Nutrition assistant. Today: ${today()}. Estimate nutrition (calories, protein, carbs, fats, fiber, sugar, sodium) on the moderately higher side. Mutations require approval.`,
  query_entries: `Nutrition assistant. Today: ${today()}. Help user review their meal history.`,
  modify_entry: `Nutrition assistant. Today: ${today()}. Help user update or delete meal entries. To correct a mistake, use update_meal_entry - NEVER delete then update. Only delete if the user did not actually eat that meal. Mutations require approval.`,
  profile: `Nutrition assistant. Today: ${today()}. Help user with profile settings and goals. For new profiles, calculate BMR (Mifflin-St Jeor), TDEE, and macro targets. Mutations require approval.`,
  general: `Friendly nutrition assistant. Today: ${today()}. Answer nutrition questions and provide guidance.`,
};

const model = wrapLanguageModel({
  model: openai("gpt-4o"),
  middleware: devToolsMiddleware(),
});

const classifierModel = wrapLanguageModel({
  model: openai("gpt-5.4-nano"),
  middleware: devToolsMiddleware(),
});

// =============================================================================
// ChatService
// =============================================================================

@injectable()
export class ChatService {
  constructor(
    private mealEntryRepo = inject(MEAL_ENTRY_REPO),
    private profileRepo = inject(PROFILE_REPO),
    private auth = inject(AUTH_CONTEXT),
  ) {}

  /**
   * Create a tool from a tool definition with output schema validation.
   * Uses `any` for AI SDK compatibility but validates output at runtime.
   */
  private createTool<
    TInputSchema extends z.ZodTypeAny,
    TOutputSchema extends z.ZodTypeAny,
  >(
    toolDef: ToolDefinition<TInputSchema, TOutputSchema>,
    execute: (input: z.infer<TInputSchema>) => Promise<z.infer<TOutputSchema>>,
  ) {
    return tool({
      description: toolDef.description,
      inputSchema: toolDef.inputSchema,
      execute: async (input: z.infer<TInputSchema>) => {
        const result = await execute(input);
        // Validate output against schema - throws ZodError if invalid
        return toolDef.outputSchema.parse(result);
      },
      needsApproval: toolDef.approval.require,
    } as any);
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
   * Classify the user's intent from conversation context.
   */
  private async classifyIntent(messages: UIMessage[]): Promise<Intent> {
    const conversationContext = this.buildConversationContext(messages);

    const { output } = await generateText({
      model: classifierModel,
      output: Output.object({
        schema: intentSchema,
      }),
      prompt: `Classify the user's intent based on the conversation context. Consider what the assistant was asking for and what the user is responding to.

Intents:
- log_meal: User wants to log/record food they ate
- query_entries: User wants to see past meals or history
- modify_entry: User wants to update or delete an existing entry
- profile: User asks about or wants to change profile/goals/targets (including providing profile information when asked)
- general: General questions, greetings, or nutrition advice

Conversation:
${conversationContext}

What is the user's intent?`,
    });

    return output?.intent ?? "general";
  }

  /**
   * Build tools map for the given intent.
   */
  private buildTools(userId: string, intent: Intent, frontendToolDefs: any) {
    const tools: Record<string, any> = {
      ...frontendTools(frontendToolDefs),
    };

    // Query tools for entries
    if (intent === "query_entries" || intent === "modify_entry") {
      const getByDate = toolRegistry.get_entries_by_date;
      tools[getByDate.name] = this.createTool(getByDate, async ({ date }) => {
        const entries = await this.mealEntryRepo.getByDate(userId, date);
        return {
          date,
          entries,
          totalCalories: entries.reduce((sum, e) => sum + (e.calories || 0), 0),
          totalProtein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
          totalCarbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
          totalFats: entries.reduce((sum, e) => sum + (e.fats || 0), 0),
        };
      });

      const getByDateRange = toolRegistry.get_entries_by_date_range;
      tools[getByDateRange.name] = this.createTool(
        getByDateRange,
        async ({ startDate, endDate }) => {
          const entries = await this.mealEntryRepo.getByDateRange(
            userId,
            startDate,
            endDate,
          );
          return {
            startDate,
            endDate: endDate ?? startDate,
            entries,
            totalCalories: entries.reduce(
              (sum, e) => sum + (e.calories || 0),
              0,
            ),
            totalProtein: entries.reduce((sum, e) => sum + (e.protein || 0), 0),
            totalCarbs: entries.reduce((sum, e) => sum + (e.carbs || 0), 0),
            totalFats: entries.reduce((sum, e) => sum + (e.fats || 0), 0),
          };
        },
      );

      const getById = toolRegistry.get_entry_by_id;
      tools[getById.name] = this.createTool(getById, async ({ id }) => {
        const entry = await this.mealEntryRepo.getById(userId, id);
        return entry ?? { error: `Entry not found: ${id}` };
      });
    }

    // Log meal tool
    if (intent === "log_meal") {
      const createMeal = toolRegistry.create_meal_entry;
      tools[createMeal.name] = this.createTool(createMeal, async (data) => {
        const entry = await this.mealEntryRepo.create(userId, data);
        return {
          success: true as const,
          message: `Logged ${entry.name} (${entry.calories} kcal)`,
          entry,
        };
      });
    }

    // Modify entry tools
    if (intent === "modify_entry") {
      const updateMeal = toolRegistry.update_meal_entry;
      tools[updateMeal.name] = this.createTool(
        updateMeal,
        async ({ id, ...data }) => {
          const entry = await this.mealEntryRepo.update(userId, id, data);
          return {
            success: true as const,
            message: `Updated ${entry.name}`,
            entry,
          };
        },
      );

      const deleteMeal = toolRegistry.delete_meal_entry;
      tools[deleteMeal.name] = this.createTool(deleteMeal, async ({ id }) => {
        const entry = await this.mealEntryRepo.getById(userId, id);
        if (!entry) {
          return { success: false as const, error: `Entry not found: ${id}` };
        }
        await this.mealEntryRepo.delete(userId, id);
        return {
          success: true as const,
          message: `Deleted ${entry.name}`,
          deletedEntry: entry,
        };
      });
    }

    // Profile tools
    if (intent === "profile") {
      const getProfile = toolRegistry.get_profile;
      tools[getProfile.name] = this.createTool(getProfile, async () => {
        const profile = await this.profileRepo.getByUserId(userId);
        return profile ?? { error: "No profile found" };
      });

      const createProfile = toolRegistry.create_profile;
      tools[createProfile.name] = this.createTool(
        createProfile,
        async (data) => {
          const profile = await this.profileRepo.create(userId, data);
          return {
            success: true as const,
            message: "Profile created",
            profile,
          };
        },
      );

      const updateProfile = toolRegistry.update_profile;
      tools[updateProfile.name] = this.createTool(
        updateProfile,
        async (data) => {
          const profile = await this.profileRepo.update(userId, data);
          return {
            success: true as const,
            message: "Profile updated",
            profile,
          };
        },
      );

      const deleteProfile = toolRegistry.delete_profile;
      tools[deleteProfile.name] = this.createTool(deleteProfile, async () => {
        await this.profileRepo.delete(userId);
        return {
          success: true as const,
          message: "Profile deleted",
        };
      });
    }

    return tools;
  }

  /**
   * Stream a chat response with intent-based tool selection.
   */
  async streamChat(
    messages: any,
    frontendToolDefs: any,
  ): Promise<StreamTextResult<any, any>> {
    const userId = this.auth.userId;
    const intent = await this.classifyIntent(messages);
    const tools = this.buildTools(userId, intent, frontendToolDefs);

    return streamText({
      model,
      system: SYSTEM_PROMPTS[intent],
      tools,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(5),
    });
  }
}
