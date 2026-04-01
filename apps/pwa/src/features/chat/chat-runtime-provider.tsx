import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { type ReactNode } from "react";
import { toolkit } from "./toolkit";

interface ChatRuntimeProviderProps {
  children: ReactNode;
}

export function ChatRuntimeProvider({ children }: ChatRuntimeProviderProps) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: import.meta.env.VITE_CHAT_URL,
    }),
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
