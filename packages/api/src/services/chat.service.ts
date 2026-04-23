import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";

import {
  agentProfileHandler,
  InferToolOutput,
  toolGetProfile,
  toolRequestProfileUpdate,
} from "@weekly-cal/core";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  ToolLoopAgent,
  UIMessage,
  wrapLanguageModel,
  type StreamTextResult,
} from "ai";
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
    };

    return streamText({
      model: this.primaryModel!,
      system: system,
      tools: {
        ...tools,
        [agentProfileHandler.name]: tool({
          description: agentProfileHandler.description,
          inputSchema: agentProfileHandler.inputSchema,
          execute: async ({ task }, { abortSignal }) => {
            const agent = new ToolLoopAgent({
              model: this.primaryModel!,
              instructions: agentProfileHandler.instructions,
              tools: {
                [toolGetProfile.name]: tool({
                  inputSchema: toolGetProfile.inputSchema,
                  description: toolGetProfile.description,
                  execute: () => this.profileRepo.getByUserId(this.auth.userId),
                }),
                [toolRequestProfileUpdate.name]: tool({
                  inputSchema: toolRequestProfileUpdate.inputSchema,
                  description: toolRequestProfileUpdate.description,
                  execute: async (data) => {
                    return {
                      action: "UPDATE_PROFILE",
                      pendingChanges: data,
                      message: `Profile updated successfully. Your new weight is ${data.weight}kg.`,
                    } satisfies InferToolOutput<
                      typeof toolRequestProfileUpdate
                    >;
                  },
                }),
              },
              stopWhen: stepCountIs(1),
            });

            const result = await agent.generate({
              prompt: task,
              abortSignal,
            });

            const lastToolResult = result.toolResults?.at(-1)?.output;
            return lastToolResult ?? { message: result.text };
          },
        }),
      },
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(3),
    });
  }
}
