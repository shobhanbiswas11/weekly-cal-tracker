import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useAuth } from "@clerk/expo";
import { fetch } from "expo/fetch";
import { useMemo } from "react";

const API_URL =
  process.env.EXPO_PUBLIC_CHAT_ENDPOINT_URL ?? "http://localhost:3000";

export function useAppRuntime() {
  const { getToken } = useAuth();

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: `${API_URL}/api/chat`,
        fetch: fetch as typeof globalThis.fetch,
        headers: async () => {
          const token = await getToken();
          if (!token) {
            throw new Error(
              "No authentication token available. Please sign in.",
            );
          }
          return { Authorization: `Bearer ${token}` };
        },
      }),
    [getToken],
  );
  return useChatRuntime({
    transport,
  });
}
