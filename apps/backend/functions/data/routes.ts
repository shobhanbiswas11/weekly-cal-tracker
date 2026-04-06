// Data Lambda routes - handles all data queries and mutations
// Minimal validation - only check required fields (id, date)

import {
  schemaCreateMealEntry,
  schemaCreateProfile,
  schemaUpdateMealEntry,
  schemaUpdateProfile,
} from "@weekly-cal/core";
import { v4 as uuidv4 } from "uuid";
import {
  createErrorResponse,
  createResponse,
  getTodayDate,
  isValidDateFormat,
  isValidWeekFormat,
  type Route,
  type RouteHandler,
  withValidation,
} from "../shared/http";
import * as dashboardService from "./domain/dashboard-service";
import * as entryRepo from "./domain/entry-repository";
import * as profileRepo from "./domain/profile-repository";

// =============================================================================
// Route Handlers
// =============================================================================

// GET /dashboard - App init data
const handleGetDashboard: RouteHandler = async (_event, userId) => {
  const dashboard = await dashboardService.getDashboard(userId);
  return createResponse(dashboard);
};

// GET /weeks/{weekId} - Get specific week summary
const handleGetWeek: RouteHandler = async (event, userId) => {
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
const handleCreateEntry = withValidation(
  schemaCreateMealEntry.omit({ createdAt: true, updatedAt: true }),
  async (_event, userId, entryData) => {
    const entryId = uuidv4();

    const entry = await entryRepo.createEntry(userId, entryId, {
      ...entryData,
      date: entryData.date || getTodayDate(),
    });

    return createResponse(entry, 201);
  },
);

// PUT /entries/{date}/{id} - Update food entry
const handleUpdateEntry = withValidation(
  schemaUpdateMealEntry,
  async (event, userId, body) => {
    const { date, id } = event.pathParameters || {};

    if (!date || !id) {
      return createErrorResponse("Date and entry ID are required", 400);
    }

    if (!isValidDateFormat(date)) {
      return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const entry = await entryRepo.updateEntry(userId, date, id, body);

    if (!entry) {
      return createErrorResponse("Entry not found or no updates provided", 404);
    }

    return createResponse(entry);
  },
);

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
const handleUpdateProfile = withValidation(
  schemaUpdateProfile,
  async (_event, userId, body) => {
    const profile = await profileRepo.upsertProfile(userId, body);
    return createResponse({ profile });
  },
);

// POST /profile - Create user profile
const handleCreateProfile = withValidation(
  schemaCreateProfile,
  async (_event, userId, body) => {
    const profile = await profileRepo.upsertProfile(userId, body);
    return createResponse({ profile }, 201);
  },
);

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
