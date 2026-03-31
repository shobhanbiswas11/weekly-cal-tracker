import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { type ReactNode } from "react";

interface ChatRuntimeProviderProps {
  children: ReactNode;
}

export function ChatRuntimeProvider({ children }: ChatRuntimeProviderProps) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: import.meta.env.VITE_CHAT_URL,
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
