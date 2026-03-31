import { AssistantRuntimeProvider, Tools, useAui } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { type ReactNode } from "react";
import { CHAT_URL, getAuthToken } from "../../lib/api";
import { toolkit } from "./toolkit";

interface ChatRuntimeProviderProps {
  children: ReactNode;
}

export function ChatRuntimeProvider({ children }: ChatRuntimeProviderProps) {
  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: CHAT_URL,
      headers: async () => {
        const token = await getAuthToken();
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),
  });

  const aui = useAui({
    tools: Tools({ toolkit }),
  });

  return (
    <AssistantRuntimeProvider aui={aui} runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
