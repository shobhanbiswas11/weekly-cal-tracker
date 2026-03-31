// Chat Lambda - AI conversation with streaming responses
// Uses AI SDK with Lambda Response Streaming

import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

// Create web-compatible ReadableStream from Node stream
// Note: For Lambda streaming, we use awslambda.HttpResponseStream

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

// System prompt for the nutrition assistant
const SYSTEM_PROMPT = `You are a friendly nutrition assistant for a calorie tracking app. Help users log their meals, answer nutrition questions, and provide encouragement.

When a user describes what they ate:
1. Use the createFoodEntry tool for EACH distinct food item
2. Estimate nutritional content based on typical portions
3. Be conversational and supportive

When a user wants to modify entries:
- Use updateFoodEntry to change existing entries
- Use deleteFoodEntry to remove entries

Guidelines:
- If quantity isn't specified, use reasonable typical portions
- Round nutritional values to whole numbers
- Be encouraging about their tracking efforts
- Provide helpful nutrition tips when relevant

Examples of estimation:
- "2 eggs" → ~140 cal, 12g protein, 1g carbs, 10g fat
- "slice of toast with butter" → ~150 cal, 3g protein, 20g carbs, 7g fat
- "large latte" → ~190 cal, 10g protein, 18g carbs, 7g fat
- "chicken caesar salad" → ~400 cal, 35g protein, 15g carbs, 22g fat`;

// Tool schemas for frontend execution
const createFoodEntrySchema = z.object({
  date: z
    .string()
    .optional()
    .describe("Date in YYYY-MM-DD format, defaults to today"),
  name: z.string().describe("Name of the food item"),
  calories: z.number().describe("Estimated calories"),
  protein: z.number().describe("Estimated grams of protein"),
  carbs: z.number().describe("Estimated grams of carbohydrates"),
  fat: z.number().describe("Estimated grams of fat"),
});

const updateFoodEntrySchema = z.object({
  date: z.string().describe("Date of the entry (YYYY-MM-DD)"),
  id: z.string().describe("ID of the entry to update"),
  name: z.string().optional().describe("New name for the food item"),
  calories: z.number().optional().describe("New calorie value"),
  protein: z.number().optional().describe("New protein value in grams"),
  carbs: z.number().optional().describe("New carbs value in grams"),
  fat: z.number().optional().describe("New fat value in grams"),
});

const deleteFoodEntrySchema = z.object({
  date: z.string().describe("Date of the entry (YYYY-MM-DD)"),
  id: z.string().describe("ID of the entry to delete"),
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
  dateOfBirth: z.string().optional(),
  biologicalSex: z.enum(["male", "female"]).optional(),
  height: z.number().optional(),
  currentWeight: z.number().optional(),
  targetWeight: z.number().optional(),
  activityLevel: z
    .enum([
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extremely_active",
    ])
    .optional(),
  primaryGoal: z
    .enum([
      "lose_weight",
      "gain_muscle",
      "maintain",
      "body_recomposition",
      "improve_health",
    ])
    .optional(),
});

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

// Extract userId from JWT (simplified - actual implementation depends on how you validate JWT)
const getUserIdFromAuth = (authHeader: string | undefined): string | null => {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  // In production, validate JWT and extract claims
  // For now, we'll rely on API Gateway JWT authorizer
  // This function is for cases where we need manual extraction
  try {
    const token = authHeader.slice(7);
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    return payload.sub;
  } catch {
    return null;
  }
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

    try {
      // Get user ID from JWT authorizer claims
      const userId =
        event.requestContext?.authorizer?.jwt?.claims?.sub ||
        getUserIdFromAuth(
          event.headers?.authorization || event.headers?.Authorization,
        );

      if (!userId) {
        responseStream.setContentType("application/json");
        responseStream.write(JSON.stringify({ error: "Unauthorized" }));
        responseStream.end();
        return;
      }

      // Parse request body
      const body: ChatRequest = JSON.parse(event.body || "{}");

      if (!body.messages || !Array.isArray(body.messages)) {
        responseStream.setContentType("application/json");
        responseStream.write(
          JSON.stringify({ error: "Messages array required" }),
        );
        responseStream.end();
        return;
      }

      // Set up streaming response with correct content type for AI SDK
      responseStream.setContentType("text/plain; charset=utf-8");
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseStream.setHeader?.(key, value);
      });

      // Create the AI stream with tools
      const result = streamText({
        model: openai("gpt-4o"),
        system: SYSTEM_PROMPT,
        messages: body.messages,
        tools: {
          // These tools are defined for the AI but executed on the frontend
          createFoodEntry: tool({
            description:
              "Create a new food entry. Call this for each food item the user mentions.",
            parameters: createFoodEntrySchema,
            // Tools are executed on frontend, so we just return success
            execute: async (args) => {
              return { success: true, action: "createFoodEntry", ...args };
            },
          }),
          updateFoodEntry: tool({
            description: "Update an existing food entry",
            parameters: updateFoodEntrySchema,
            execute: async (args) => {
              return { success: true, action: "updateFoodEntry", ...args };
            },
          }),
          deleteFoodEntry: tool({
            description: "Delete a food entry",
            parameters: deleteFoodEntrySchema,
            execute: async (args) => {
              return { success: true, action: "deleteFoodEntry", ...args };
            },
          }),
          updateProfile: tool({
            description: "Update user profile information",
            parameters: updateProfileSchema,
            execute: async (args) => {
              return { success: true, action: "updateProfile", ...args };
            },
          }),
        },
        maxSteps: 5, // Allow multiple tool calls
      });

      // Stream the response using Data Stream Protocol
      const stream = result.toDataStream();
      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        responseStream.write(value);
      }

      responseStream.end();
    } catch (error) {
      console.error("Chat error:", error);
      responseStream.setContentType("application/json");
      responseStream.write(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Internal error",
        }),
      );
      responseStream.end();
    }
  },
);

// Declare the awslambda global for TypeScript
declare const awslambda: {
  streamifyResponse: (
    handler: (event: any, responseStream: any, context: any) => Promise<void>,
  ) => (event: any, context: any) => Promise<void>;
  HttpResponseStream: {
    from: (responseStream: any, metadata: any) => any;
  };
};
