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
import { createContext, type ReactNode, useCallback, useContext } from "react";
import { buildSystemPrompt } from "./prompts";
import { ToolApprovalProvider } from "./tool-approval";
import { toolkit } from "./toolkit";

interface ClearChatContextValue {
  clearChat: () => void;
}

const ClearChatContext = createContext<ClearChatContextValue | null>(null);

export function useClearChat() {
  const context = useContext(ClearChatContext);
  if (!context) {
    throw new Error("useClearChat must be used within a ChatRuntimeProvider");
  }
  return context;
}

const transport = new AssistantChatTransport({
  api: import.meta.env.VITE_CHAT_URL,
  headers: async () => {
    const token = await window.Clerk?.session?.getToken();
    if (!token) {
      throw new Error("No authentication token available. Please sign in.");
    }
    return { Authorization: `Bearer ${token}` };
  },
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

  const clearChat = useCallback(() => {
    chatHelpers.setMessages([]);
  }, [chatHelpers]);

  return (
    <ClearChatContext.Provider value={{ clearChat }}>
      <ToolApprovalProvider
        addToolApprovalResponse={chatHelpers.addToolApprovalResponse}
        messages={chatHelpers.messages}
      >
        <AssistantRuntimeProvider runtime={runtime} aui={aui}>
          <SystemInstructions />
          {children}
        </AssistantRuntimeProvider>
      </ToolApprovalProvider>
    </ClearChatContext.Provider>
  );
}

function SystemInstructions() {
  const profile = useProfile();

  useAssistantInstructions({
    instruction: buildSystemPrompt(profile ?? undefined),
  });

  return null;
}
