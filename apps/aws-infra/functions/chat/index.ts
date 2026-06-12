import {
  ChatService,
  createRequestContainer,
  getRootContainer,
  initContainer,
  SubscriptionService,
  TokenVerificationService,
} from "@weekly-cal/api";
import type { UIMessage } from "ai";
import { createCorsHeaders } from "../shared/http";
import { getSecret } from "../shared/secrets";

// Fetch secrets from SSM at cold start, then initialize
const init = (async () => {
  const [openaiKey, clerkKey, revenuecatKey] = await Promise.all([
    getSecret(process.env.SSM_OPENAI_API_KEY!),
    getSecret(process.env.SSM_CLERK_SECRET_KEY!),
    getSecret(process.env.SSM_REVENUECAT_SECRET_KEY!),
  ]);
  process.env.OPENAI_API_KEY = openaiKey;
  process.env.CLERK_SECRET_KEY = clerkKey;
  process.env.REVENUECAT_SECRET_KEY = revenuecatKey;
  initContainer();
})();

interface ChatRequest {
  messages: UIMessage[];
  system?: string;
  tools?: any;
}

// CORS headers for streaming responses
const corsHeaders = createCorsHeaders("POST,OPTIONS");

// Helper to send error response
function sendError(
  responseStream: any,
  statusCode: number,
  message: string,
): void {
  responseStream.setContentType("application/json");
  Object.entries(corsHeaders).forEach(([key, value]) => {
    responseStream.setHeader?.(key, value);
  });
  responseStream.write(JSON.stringify({ error: message }));
  responseStream.end();
}

// Handler for Lambda with response streaming
export const handler = awslambda.streamifyResponse(
  async (event: any, responseStream: any, _context: any) => {
    await init;

    // Handle preflight
    if (event.requestContext?.http?.method === "OPTIONS") {
      responseStream.setContentType("text/plain");
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseStream.setHeader?.(key, value);
      });
      responseStream.write("");
      responseStream.end();
      return;
    }

    // Verify JWT token from Authorization header (networkless using public key)
    const authHeader =
      event.headers?.authorization || event.headers?.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return sendError(
        responseStream,
        401,
        "Missing or invalid Authorization header",
      );
    }

    const token = authHeader.slice(7);
    let userId: string;

    try {
      const tokenService = getRootContainer().get(TokenVerificationService);
      userId = await tokenService.verifyToken(token);
    } catch (error) {
      console.error("Token verification failed:", error);
      return sendError(responseStream, 401, "Token verification failed");
    }

    // Parse request body
    const body: ChatRequest = JSON.parse(event.body || "{}");

    if (!body.messages || !Array.isArray(body.messages)) {
      return sendError(responseStream, 400, "Messages array required");
    }

    // Create request-scoped container with authenticated user
    const container = createRequestContainer(userId);

    // Check subscription / free-tier chat access
    const subscriptionService = container.get(SubscriptionService);
    const chatAccess = await subscriptionService.checkChatAccess();

    if (!chatAccess.allowed) {
      return sendError(
        responseStream,
        403,
        JSON.stringify({
          code: "CHAT_LIMIT_REACHED",
          message:
            "Free tier chat limit reached. Upgrade to Pro for unlimited chat.",
          chatMessageCount: chatAccess.chatMessageCount,
          limit: chatAccess.limit,
        }),
      );
    }

    // Set up streaming response
    responseStream.setContentType("text/plain; charset=utf-8");
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseStream.setHeader?.(key, value);
    });

    const chatService = container.get(ChatService);

    // Create the AI stream
    const result = await chatService.streamChat(
      body.messages,
      body.tools,
      body.system,
    );

    // Get the encoded UI message stream from the Response body
    const response = result.toUIMessageStreamResponse();
    const reader = response.body!.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseStream.write(value);
      }

      // Increment chat count only after successful stream (free users only)
      if (chatAccess.reason === "free_within_limit") {
        await subscriptionService.incrementChatMessageCount();
      }
    } finally {
      reader.releaseLock();
      responseStream.end();
    }
  },
);
