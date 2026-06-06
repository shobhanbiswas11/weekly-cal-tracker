import { threadListAdapter } from "@/lib/thread-list-adapter";
import {
  AssistantChatTransport,
  useChatRuntime as useAiSdkChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { useRemoteThreadListRuntime } from "@assistant-ui/react-native";
import { fetch } from "expo/fetch";
import { useMemo } from "react";
import { useAppAuth } from "./use-auth";

const API_URL =
  process.env.EXPO_PUBLIC_CHAT_ENDPOINT_URL ?? "http://localhost:3000";

export function useChatRuntime() {
  const { getToken } = useAppAuth();

  const runtime = useRemoteThreadListRuntime({
    runtimeHook: () => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
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

        [],
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useAiSdkChatRuntime({ transport });
    },
    adapter: threadListAdapter,
  });

  return runtime;
}
