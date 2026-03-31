// Data Lambda routes - handles all data queries and mutations
// Minimal validation - only check required fields (id, date)

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
import type { DataRecord } from "../shared/types";
import * as dashboardService from "./domain/dashboard-service";
import * as entryRepo from "./domain/entry-repository";
import * as profileRepo from "./domain/profile-repository";

// =============================================================================
// Route Handlers
// =============================================================================

type ApiEvent = Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0];
type ApiResult = Promise<APIGatewayProxyResultV2>;
type RouteHandler = (event: ApiEvent, userId: string) => ApiResult;

// GET /dashboard - App init data
const handleGetDashboard: RouteHandler = async (
  _event,
  userId,
): Promise<APIGatewayProxyResultV2> => {
  const dashboard = await dashboardService.getDashboard(userId);
  return createResponse(dashboard);
};

// GET /weeks/{weekId} - Get specific week summary
const handleGetWeek: RouteHandler = async (
  event,
  userId,
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

// GET /entries/{date} - Get entries for a specific date
const handleGetEntriesByDate: RouteHandler = async (event, userId) => {
  const date = event.pathParameters?.date;

  if (!date) {
    return createErrorResponse("Date is required", 400);
  }

  if (!isValidDateFormat(date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const entries = await entryRepo.getEntriesByDate(userId, date);
  return createResponse({ entries });
};

// POST /entries - Create new food entry
const handleCreateEntry: RouteHandler = async (event, userId) => {
  const body = parseBody<DataRecord>(event.body);

  if (!body) {
    return createErrorResponse("Request body is required", 400);
  }

  // Only validate date format if provided
  if (body.date && !isValidDateFormat(body.date as string)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const entryId = uuidv4();
  const entry = await entryRepo.createEntry(userId, entryId, {
    ...body,
    date: (body.date as string) || getTodayDate(),
  });

  return createResponse(entry, 201);
};

// PUT /entries/{date}/{id} - Update food entry
const handleUpdateEntry: RouteHandler = async (event, userId) => {
  const { date, id } = event.pathParameters || {};

  if (!date || !id) {
    return createErrorResponse("Date and entry ID are required", 400);
  }

  if (!isValidDateFormat(date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const body = parseBody<DataRecord>(event.body);

  if (!body) {
    return createErrorResponse("Request body is required", 400);
  }

  const entry = await entryRepo.updateEntry(userId, date, id, body);

  if (!entry) {
    return createErrorResponse("Entry not found or no updates provided", 404);
  }

  return createResponse(entry);
};

// DELETE /entries/{date}/{id} - Delete food entry
const handleDeleteEntry: RouteHandler = async (event, userId) => {
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
const handleUpdateProfile: RouteHandler = async (event, userId) => {
  const body = parseBody<DataRecord>(event.body);

  if (!body || typeof body !== "object") {
    return createErrorResponse("Request body is required", 400);
  }

  const profile = await profileRepo.upsertProfile(userId, body);

  return createResponse({ profile });
};

// POST /profile - Create user profile
const handleCreateProfile: RouteHandler = async (event, userId) => {
  const body = parseBody<DataRecord>(event.body);

  if (!body || typeof body !== "object") {
    return createErrorResponse("Request body is required", 400);
  }

  const profile = await profileRepo.upsertProfile(userId, body);

  return createResponse({ profile }, 201);
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
  {
    method: "GET",
    pattern: /^\/entries\/[^/]+$/,
    handler: handleGetEntriesByDate,
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
    method: "POST",
    pattern: /^\/profile$/,
    handler: handleCreateProfile,
  },
  {
    method: "PUT",
    pattern: /^\/profile$/,
    handler: handleUpdateProfile,
  },
];
