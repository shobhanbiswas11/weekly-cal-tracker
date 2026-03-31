// HTTP utilities for Lambda functions

import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Create CORS headers
export const createCorsHeaders = (
  methods: string = "GET,POST,PUT,DELETE,OPTIONS",
): Record<string, string> => ({
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": methods,
  "Content-Type": "application/json",
});

// Create a successful response
export const createResponse = <T>(
  data: T,
  statusCode: number = 200,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: createCorsHeaders(),
  body: JSON.stringify({ success: true, data } as ApiResponse<T>),
});

// Create an error response
export const createErrorResponse = (
  error: string,
  statusCode: number = 400,
): APIGatewayProxyResultV2 => ({
  statusCode,
  headers: createCorsHeaders(),
  body: JSON.stringify({ success: false, error } as ApiResponse<never>),
});

// Create CORS preflight response
export const createPreflightResponse = (): APIGatewayProxyResultV2 => ({
  statusCode: 200,
  headers: createCorsHeaders(),
  body: "",
});

// Extract userId from JWT claims
export const getUserId = (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
): string => {
  const claims = event.requestContext.authorizer.jwt.claims;
  return claims.sub as string;
};

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

// Validate date format (YYYY-MM-DD)
export const isValidDateFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

// Validate ISO week format (YYYY-Www)
export const isValidWeekFormat = (week: string): boolean => {
  return /^\d{4}-W\d{2}$/.test(week);
};

// Parse request body with error handling
export const parseBody = <T>(body: string | undefined): T | null => {
  if (!body) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
};

// Route handler type
export type RouteHandler = (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
) => Promise<APIGatewayProxyResultV2>;

// Route definition
export interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

// Simple router for Lambda
export const createRouter = (routes: Route[]) => {
  return async (
    event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  ): Promise<APIGatewayProxyResultV2> => {
    const method = event.requestContext.http.method;
    const path = event.rawPath;

    // Handle preflight
    if (method === "OPTIONS") {
      return createPreflightResponse();
    }

    // Find matching route
    for (const route of routes) {
      if (route.method === method && route.pattern.test(path)) {
        try {
          const userId = getUserId(event);
          return await route.handler(event, userId);
        } catch (error) {
          console.error(`Error in ${method} ${path}:`, error);
          const message =
            error instanceof Error ? error.message : "Unknown error";
          return createErrorResponse(`Internal error: ${message}`, 500);
        }
      }
    }

    return createErrorResponse(`Not found: ${method} ${path}`, 404);
  };
};
