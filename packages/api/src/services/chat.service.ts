import { frontendTools } from "@assistant-ui/react-ai-sdk";

import { convertToModelMessages, UIMessage, type StreamTextResult } from "ai";
import { PrimaryAgent } from "../agents";
import { inject, injectable } from "../di";
import { ModelService } from "./model.service";

// =============================================================================
// ChatService
// =============================================================================

@injectable()
export class ChatService {
  constructor(
    private modelService = inject(ModelService),
    private primaryAgent = inject(PrimaryAgent),
  ) {}

  async streamChat(
    messages: UIMessage[],
    frontendToolDefs: any,
    system?: string,
  ): Promise<StreamTextResult<any, any>> {
    const model = await this.modelService.getPrimary();

    return this.primaryAgent.stream(
      model,
      await convertToModelMessages(messages),
      frontendTools(frontendToolDefs),
      system,
    );
  }
}
