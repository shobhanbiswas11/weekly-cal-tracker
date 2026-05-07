import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { fetch } from "expo/fetch";
import { useMemo } from "react";

const API_URL =
  process.env.EXPO_PUBLIC_CHAT_ENDPOINT_URL ?? "http://localhost:3000";

export function useAppRuntime() {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: `${API_URL}/api/chat`,
        fetch: fetch as typeof globalThis.fetch,
      }),
    [],
  );
  return useChatRuntime({
    transport,
  });
}
