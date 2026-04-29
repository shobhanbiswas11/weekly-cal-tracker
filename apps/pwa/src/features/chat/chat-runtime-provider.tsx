import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { type ReactNode } from "react";
import { toolkit } from "./toolkit";
import { useAutoCancelInitiatedFlows } from "./use-auto-cancel-initiated-flows";

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

/**
 * Component that hooks into chat events for auto-cancellation of initiated flows.
 * Must be rendered inside AssistantRuntimeProvider.
 */
function ChatEventHandlers() {
  useAutoCancelInitiatedFlows();
  return null;
}

export function ChatRuntimeProvider({ children }: ChatRuntimeProviderProps) {
  const runtime = useChatRuntime({
    transport,
  });

  const aui = useAui({
    tools: Tools({ toolkit }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <ChatEventHandlers />
      {children}
    </AssistantRuntimeProvider>
  );
}
