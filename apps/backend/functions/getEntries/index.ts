// getEntries Lambda - Get all entries for a specific date

import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { getEntriesByDate } from "../shared/dynamodb";
import { ApiResponse, DailySummary } from "../shared/types";

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Extract userId from JWT claims
const getUserId = (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
): string => {
  const claims = event.requestContext.authorizer.jwt.claims;
  return claims.sub as string;
};

// Create CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
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

    // Get date from query parameter or default to today
    const date = event.queryStringParameters?.date || getTodayDate();

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Invalid date format. Use YYYY-MM-DD",
        } as ApiResponse<never>),
      };
    }

    const entries = await getEntriesByDate(userId, date);

    // Calculate totals
    const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
    const totalCarbs = entries.reduce((sum, e) => sum + e.carbs, 0);
    const totalFat = entries.reduce((sum, e) => sum + e.fat, 0);

    const summary: DailySummary = {
      date,
      entries,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: summary,
      } as ApiResponse<DailySummary>),
    };
  } catch (error) {
    console.error("Error fetching entries:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: `Failed to fetch entries: ${errorMessage}`,
      } as ApiResponse<never>),
    };
  }
};
