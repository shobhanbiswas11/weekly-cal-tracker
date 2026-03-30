import { AssistantChatTransport } from '@assistant-ui/react-ai-sdk';

const BACKEND_URL = 'http://localhost:3000';

/**
 * Creates a chat transport with JWT authentication
 */
export function createAuthenticatedTransport() {
  return new AssistantChatTransport({
    api: `${BACKEND_URL}/chat`,
    headers: () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error(
          'No access token found. User might not be authenticated.',
        );
      }
      return { Authorization: `Bearer ${token}` };
    },
  });
}
