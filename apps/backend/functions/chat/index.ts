// Chat Lambda - AI conversation with streaming responses
// Uses AI SDK with Lambda Response Streaming for assistant-ui

import type { UIMessage } from "ai";
import { streamChat } from "../../services/chat.service";

interface ChatRequest {
  messages: UIMessage[];
  system?: string;
  tools?: any;
}

// System prompt for the nutrition assistant

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

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

    // Parse request body
    const body: ChatRequest = JSON.parse(event.body || "{}");

    if (!body.messages || !Array.isArray(body.messages)) {
      responseStream.setContentType("application/json");
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseStream.setHeader?.(key, value);
      });
      responseStream.write(
        JSON.stringify({ error: "Messages array required" }),
      );
      responseStream.end();
      return;
    }

    // Set up streaming response
    responseStream.setContentType("text/plain; charset=utf-8");
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseStream.setHeader?.(key, value);
    });

    // Create the AI stream with convertToModelMessages for AI SDK v6
    const result = await streamChat(body.messages, body.tools);

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
