import { useProfile } from "@/features/profile";
import {
  AssistantRuntimeProvider,
  Tools,
  useAssistantInstructions,
  useAui,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { type ReactNode } from "react";
import { buildSystemPrompt } from "./prompts";
import { toolkit } from "./toolkit";

const transport = new AssistantChatTransport({
  api: import.meta.env.VITE_CHAT_URL,
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
      <SystemInstructions />
      {children}
    </AssistantRuntimeProvider>
  );
}

function SystemInstructions() {
  const profile = useProfile();

  useAssistantInstructions({
    instruction: buildSystemPrompt(profile ?? undefined),
  });

  return null;
}
