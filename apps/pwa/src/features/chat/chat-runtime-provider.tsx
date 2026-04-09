import { useProfile } from "@/features/profile";
import { useChat } from "@ai-sdk/react";
import {
  AssistantRuntimeProvider,
  Tools,
  useAssistantInstructions,
  useAui,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useAISDKRuntime,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import type { ReactNode } from "react";
import { buildSystemPrompt } from "./prompts";
import { ToolApprovalProvider } from "./tool-approval";
import { toolkit } from "./toolkit";

const transport = new AssistantChatTransport({
  api: import.meta.env.VITE_CHAT_URL,
});

interface ChatRuntimeProviderProps {
  children: ReactNode;
}

export function ChatRuntimeProvider({ children }: ChatRuntimeProviderProps) {
  const chatHelpers = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  const runtime = useAISDKRuntime(chatHelpers);

  const aui = useAui({
    tools: Tools({ toolkit }),
  });

  return (
    <ToolApprovalProvider
      addToolApprovalResponse={chatHelpers.addToolApprovalResponse}
      messages={chatHelpers.messages}
    >
      <AssistantRuntimeProvider runtime={runtime} aui={aui}>
        <SystemInstructions />
        {children}
      </AssistantRuntimeProvider>
    </ToolApprovalProvider>
  );
}

function SystemInstructions() {
  const profile = useProfile();

  useAssistantInstructions({
    instruction: buildSystemPrompt(profile ?? undefined),
  });

  return null;
}
