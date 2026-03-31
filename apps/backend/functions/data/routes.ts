// Data Lambda routes - handles all data queries and mutations

import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import {
  createErrorResponse,
  createResponse,
  getTodayDate,
  isValidDateFormat,
  isValidWeekFormat,
  parseBody,
  type Route,
} from "../shared/http";
import type {
  CreateFoodEntryRequest,
  Profile,
  UpdateFoodEntryRequest,
} from "../shared/types";
import * as dashboardService from "./domain/dashboard-service";
import * as entryRepo from "./domain/entry-repository";
import * as profileRepo from "./domain/profile-repository";

// =============================================================================
// Route Handlers
// =============================================================================

// GET /dashboard - App init data
const handleGetDashboard = async (
  _event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
): Promise<APIGatewayProxyResultV2> => {
  const dashboard = await dashboardService.getDashboard(userId);
  return createResponse(dashboard);
};

// GET /weeks/{weekId} - Get specific week summary
const handleGetWeek = async (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
): Promise<APIGatewayProxyResultV2> => {
  const weekId = event.pathParameters?.weekId;

  if (!weekId) {
    return createErrorResponse("Week ID is required", 400);
  }

  if (!isValidWeekFormat(weekId)) {
    return createErrorResponse(
      "Invalid week format. Use YYYY-Www (e.g., 2026-W13)",
      400,
    );
  }

  const summary = await dashboardService.getWeeklySummary(userId, weekId);
  return createResponse(summary);
};

// POST /entries - Create new food entry
const handleCreateEntry = async (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
): Promise<APIGatewayProxyResultV2> => {
  const body = parseBody<CreateFoodEntryRequest>(event.body);

  if (!body) {
    return createErrorResponse("Request body is required", 400);
  }

  if (!body.name || typeof body.name !== "string") {
    return createErrorResponse("Name is required", 400);
  }

  if (typeof body.calories !== "number" || body.calories < 0) {
    return createErrorResponse("Valid calories value is required", 400);
  }

  if (typeof body.protein !== "number" || body.protein < 0) {
    return createErrorResponse("Valid protein value is required", 400);
  }

  if (typeof body.carbs !== "number" || body.carbs < 0) {
    return createErrorResponse("Valid carbs value is required", 400);
  }

  if (typeof body.fat !== "number" || body.fat < 0) {
    return createErrorResponse("Valid fat value is required", 400);
  }

  // Validate date if provided
  if (body.date && !isValidDateFormat(body.date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const entryId = uuidv4();
  const entry = await entryRepo.createEntry(userId, entryId, {
    ...body,
    date: body.date || getTodayDate(),
  });

  return createResponse(entry, 201);
};

// PUT /entries/{date}/{id} - Update food entry
const handleUpdateEntry = async (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
): Promise<APIGatewayProxyResultV2> => {
  const { date, id } = event.pathParameters || {};

  if (!date || !id) {
    return createErrorResponse("Date and entry ID are required", 400);
  }

  if (!isValidDateFormat(date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const body = parseBody<UpdateFoodEntryRequest>(event.body);

  if (!body) {
    return createErrorResponse("Request body is required", 400);
  }

  // Validate numeric fields if provided
  if (
    body.calories !== undefined &&
    (typeof body.calories !== "number" || body.calories < 0)
  ) {
    return createErrorResponse("Invalid calories value", 400);
  }
  if (
    body.protein !== undefined &&
    (typeof body.protein !== "number" || body.protein < 0)
  ) {
    return createErrorResponse("Invalid protein value", 400);
  }
  if (
    body.carbs !== undefined &&
    (typeof body.carbs !== "number" || body.carbs < 0)
  ) {
    return createErrorResponse("Invalid carbs value", 400);
  }
  if (
    body.fat !== undefined &&
    (typeof body.fat !== "number" || body.fat < 0)
  ) {
    return createErrorResponse("Invalid fat value", 400);
  }

  const entry = await entryRepo.updateEntry(userId, date, id, body);

  if (!entry) {
    return createErrorResponse("Entry not found or no updates provided", 404);
  }

  return createResponse(entry);
};

// DELETE /entries/{date}/{id} - Delete food entry
const handleDeleteEntry = async (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
): Promise<APIGatewayProxyResultV2> => {
  const { date, id } = event.pathParameters || {};

  if (!date || !id) {
    return createErrorResponse("Date and entry ID are required", 400);
  }

  if (!isValidDateFormat(date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  await entryRepo.deleteEntry(userId, date, id);

  return createResponse({ message: "Entry deleted successfully" });
};

// PUT /profile - Update user profile
const handleUpdateProfile = async (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
  userId: string,
): Promise<APIGatewayProxyResultV2> => {
  const body = parseBody<Profile>(event.body);

  if (!body || typeof body !== "object") {
    return createErrorResponse("Request body is required", 400);
  }

  const profile = await profileRepo.upsertProfile(userId, body);

  return createResponse({ profile });
};

// =============================================================================
// Route Definitions
// =============================================================================

export const routes: Route[] = [
  // Queries
  {
    method: "GET",
    pattern: /^\/dashboard$/,
    handler: handleGetDashboard,
  },
  {
    method: "GET",
    pattern: /^\/weeks\/[^/]+$/,
    handler: handleGetWeek,
  },
  // Entry mutations
  {
    method: "POST",
    pattern: /^\/entries$/,
    handler: handleCreateEntry,
  },
  {
    method: "PUT",
    pattern: /^\/entries\/[^/]+\/[^/]+$/,
    handler: handleUpdateEntry,
  },
  {
    method: "DELETE",
    pattern: /^\/entries\/[^/]+\/[^/]+$/,
    handler: handleDeleteEntry,
  },
  // Profile mutations
  {
    method: "PUT",
    pattern: /^\/profile$/,
    handler: handleUpdateProfile,
  },
];
