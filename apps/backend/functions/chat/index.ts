// Chat Lambda - AI conversation with streaming responses
// Uses AI SDK with Lambda Response Streaming for assistant-ui

import {
  ChatService,
  createRequestContainer,
  initContainer,
} from "@weekly-cal/api";
import type { UIMessage } from "ai";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Initialize DI container (validates env vars at cold start)
initContainer();

// Create JWKS fetcher at cold start (caches keys automatically)
// This is exactly how API Gateway validates JWTs - fetch public keys from {issuer}/.well-known/jwks.json
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.JWT_ISSUER}/.well-known/jwks.json`),
);

interface ChatRequest {
  messages: UIMessage[];
  system?: string;
  tools?: any;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

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
      // Standard OIDC JWT validation (same as API Gateway):
      // 1. Fetches public keys from {issuer}/.well-known/jwks.json
      // 2. Validates signature using the key matching the token's 'kid'
      // 3. Validates claims: exp, iat, iss, aud
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: process.env.JWT_ISSUER,
        // audience: process.env.JWT_AUDIENCE, // Optional: validate 'aud' claim
      });

      if (!payload.sub) {
        return sendError(responseStream, 401, "Invalid token: no subject");
      }
      userId = payload.sub;
    } catch (error) {
      console.error("Token verification failed:", error);
      return sendError(responseStream, 401, "Token verification failed");
    }

    // Parse request body
    const body: ChatRequest = JSON.parse(event.body || "{}");

    if (!body.messages || !Array.isArray(body.messages)) {
      return sendError(responseStream, 400, "Messages array required");
    }

    // Set up streaming response
    responseStream.setContentType("text/plain; charset=utf-8");
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseStream.setHeader?.(key, value);
    });

    // Create request-scoped container with authenticated user
    const container = createRequestContainer(userId);
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
    } finally {
      reader.releaseLock();
      responseStream.end();
    }
  },
);
