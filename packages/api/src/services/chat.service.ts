import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";

import { schemaUpdateProfile } from "@weekly-cal/core";
import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  tool,
  UIMessage,
  wrapLanguageModel,
  type StreamTextResult,
} from "ai";
import z from "zod";
import {
  APP_CONFIG,
  AUTH_CONTEXT,
  AuthContext,
  inject,
  injectable,
  PROFILE_REPO,
  type AppConfig,
} from "../di";
import { ProfileRepo } from "../repo/profile.repo.interface";
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
    private profileRepo: ProfileRepo = inject(PROFILE_REPO),
    private auth: AuthContext = inject(AUTH_CONTEXT),
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
      tools: {
        ...tools,
        profileAgent: tool({
          description:
            "Agent for managing (query, mutate) user profile information like age, weight, dietary preferences, etc.",
          inputSchema: z.object({
            task: z
              .string()
              .describe(
                "The task to perform, e.g. 'Update my weight', 'What's my daily calorie target?', etc.",
              ),
          }),
          execute: ({ task }) => {
            return generateText({
              model: this.primaryModel!,
              system: `You're a sub agent in a bigger system. Your job is to help the system to answer anything related to user profile. If you need any additional data to perform the task or to call a specific tool. you can ask the main system`,
              tools: {
                // getProfile
                // updateProfile
                updateProfile: tool({
                  description: "Tool to update user profile information",
                  inputSchema: schemaUpdateProfile,
                  execute: (data) => {
                    return this.profileRepo.update(this.auth.userId, data);
                  },
                }),
                // removeProfile
              },
              prompt: `Task: ${task}`,
            });
          },
        }),
      },
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
    });
  }
}
