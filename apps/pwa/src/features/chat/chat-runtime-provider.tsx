import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { type ReactNode } from "react";
import { toolkit } from "./toolkit";

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
  const runtime = useChatRuntime({
    transport,
  });

  const aui = useAui({
    tools: Tools({ toolkit }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      {children}
    </AssistantRuntimeProvider>
  );
}
