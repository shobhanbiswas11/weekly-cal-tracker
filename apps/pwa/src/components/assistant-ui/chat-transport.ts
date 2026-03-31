import { AssistantChatTransport } from "@assistant-ui/react-ai-sdk";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Creates a chat transport with Clerk JWT authentication
 */
export function createAuthenticatedTransport() {
  return new AssistantChatTransport({
    api: `${BACKEND_URL}/chat`,
    headers: async () => {
      const token = await window.Clerk?.session?.getToken();
      if (!token) {
        throw new Error("No authentication token available. Please sign in.");
      }
      return { Authorization: `Bearer ${token}` };
    },
  });
}
