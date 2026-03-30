// deleteEntry Lambda - Delete a specific calorie entry

import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { deleteEntry } from "../shared/dynamodb";
import { ApiResponse } from "../shared/types";

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
  "Access-Control-Allow-Methods": "DELETE,OPTIONS",
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

    // Get date and id from path parameters
    const { date, id } = event.pathParameters || {};

    if (!date || !id) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Date and entry ID are required",
        } as ApiResponse<never>),
      };
    }

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

    await deleteEntry(userId, date, id);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: { message: "Entry deleted successfully" },
      } as ApiResponse<{ message: string }>),
    };
  } catch (error) {
    console.error("Error deleting entry:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: `Failed to delete entry: ${errorMessage}`,
      } as ApiResponse<never>),
    };
  }
};
