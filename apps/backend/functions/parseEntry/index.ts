// parseEntry Lambda - Parse natural language food input using OpenAI

import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { saveEntry } from "../shared/dynamodb";
import {
  ApiResponse,
  CalorieEntry,
  ParseEntryRequest,
  ParseEntryResponse,
  SAVE_ENTRY_TOOL,
  SYSTEM_PROMPT,
} from "../shared/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Extract userId from JWT claims
const getUserId = (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
): string => {
  const claims = event.requestContext.authorizer.jwt.claims;
  // Clerk uses 'sub' for user ID
  return claims.sub as string;
};

// Create CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type": "application/json",
};

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  // Handle preflight
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const userId = getUserId(event);

    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Request body is required",
        } as ApiResponse<never>),
      };
    }

    const request: ParseEntryRequest = JSON.parse(event.body);

    if (!request.input || request.input.trim() === "") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Input text is required",
        } as ApiResponse<never>),
      };
    }

    const date = request.date || getTodayDate();
    const timestamp = new Date().toISOString();

    // Call OpenAI with tool calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: request.input },
      ],
      tools: [SAVE_ENTRY_TOOL],
      tool_choice: "auto",
    });

    const message = completion.choices[0].message;
    const toolCalls = message.tool_calls || [];

    if (toolCalls.length === 0) {
      // No food items detected
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            entries: [],
            message:
              message.content ||
              "I couldn't identify any food items in your input. Please try describing what you ate more specifically.",
          } as ParseEntryResponse,
        } as ApiResponse<ParseEntryResponse>),
      };
    }

    // Process each tool call and save entries
    const entries: CalorieEntry[] = [];

    for (const toolCall of toolCalls) {
      // Type guard for function tool calls
      if (
        toolCall.type === "function" &&
        toolCall.function.name === "save_calorie_entry"
      ) {
        const args = JSON.parse(toolCall.function.arguments);

        const entry: CalorieEntry = {
          id: uuidv4(),
          userId,
          date,
          name: args.name,
          calories: Math.round(args.calories),
          protein: Math.round(args.protein),
          carbs: Math.round(args.carbs),
          fat: Math.round(args.fat),
          timestamp,
          rawInput: request.input,
        };

        await saveEntry(entry);
        entries.push(entry);
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: {
          entries,
          message: `Successfully logged ${entries.length} item${entries.length > 1 ? "s" : ""}`,
        } as ParseEntryResponse,
      } as ApiResponse<ParseEntryResponse>),
    };
  } catch (error) {
    console.error("Error processing entry:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: `Failed to process entry: ${errorMessage}`,
      } as ApiResponse<never>),
    };
  }
};
