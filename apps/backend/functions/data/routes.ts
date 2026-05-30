import {
  AccountService,
  ActivityService,
  MealService,
  ProfileService,
  QueryService,
  createRequestContainer,
} from "@weekly-cal/api";
import {
  getWeekBoundaries,
  isValidDateFormat,
  isValidWeekFormat,
  schemaCreateActivityEntry,
  schemaCreateMealEntry,
  schemaCreateProfile,
  schemaUpdateActivityEntry,
  schemaUpdateMealEntry,
  schemaUpdateProfile,
} from "@weekly-cal/core";
import {
  createErrorResponse,
  createResponse,
  withValidation,
  type Route,
  type RouteHandler,
} from "../shared/http";

// =============================================================================
// Route Handlers
// =============================================================================

// GET /summary - App init data
const handleGetSummary: RouteHandler = async (_event, userId) => {
  const container = createRequestContainer(userId);
  const queryService = container.get(QueryService);
  const summary = await queryService.summary();
  return createResponse(summary);
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

  const { start, end } = getWeekBoundaries(weekId);
  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  const mealEntries = await mealService.getByDateRange(userId, start, end);
  return createResponse({ weekId, mealEntries });
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

  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  const entries = await mealService.getByDate(userId, date);
  return createResponse({ entries });
};

// POST /entries - Create new food entry
const handleCreateEntry = withValidation(
  schemaCreateMealEntry,
  async (_event, userId, entryData) => {
    const container = createRequestContainer(userId);
    const mealService = container.get(MealService);
    const entry = await mealService.create(userId, entryData);
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

    const container = createRequestContainer(userId);
    const mealService = container.get(MealService);
    const entry = await mealService.update(userId, id, body);
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

  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  await mealService.delete(userId, id);
  return createResponse({ message: "Entry deleted successfully" });
};

// PUT /profile - Update user profile
const handleUpdateProfile = withValidation(
  schemaUpdateProfile,
  async (_event, userId, body) => {
    const container = createRequestContainer(userId);
    const profileService = container.get(ProfileService);
    const profile = await profileService.update(userId, body);
    return createResponse({ profile });
  },
);

// POST /profile - Create user profile
const handleCreateProfile = withValidation(
  schemaCreateProfile,
  async (_event, userId, body) => {
    const container = createRequestContainer(userId);
    const profileService = container.get(ProfileService);
    const profile = await profileService.create(userId, body);
    return createResponse({ profile }, 201);
  },
);

// =============================================================================
// Activity Route Handlers
// =============================================================================

// GET /activities/{date} - Get activities for a specific date
const handleGetActivitiesByDate: RouteHandler = async (event, userId) => {
  const date = event.pathParameters?.date;

  if (!date) {
    return createErrorResponse("Date is required", 400);
  }

  if (!isValidDateFormat(date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const container = createRequestContainer(userId);
  const activityService = container.get(ActivityService);
  const entries = await activityService.getByDate(userId, date);
  return createResponse({ entries });
};

// POST /activities - Create new activity entry
const handleCreateActivity = withValidation(
  schemaCreateActivityEntry,
  async (_event, userId, data) => {
    const container = createRequestContainer(userId);
    const activityService = container.get(ActivityService);
    const entry = await activityService.create(userId, data);
    return createResponse(entry, 201);
  },
);

// PUT /activities/{date}/{id} - Update activity entry
const handleUpdateActivity = withValidation(
  schemaUpdateActivityEntry,
  async (event, userId, body) => {
    const { date, id } = event.pathParameters || {};

    if (!date || !id) {
      return createErrorResponse("Date and entry ID are required", 400);
    }

    if (!isValidDateFormat(date)) {
      return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
    }

    const container = createRequestContainer(userId);
    const activityService = container.get(ActivityService);
    const entry = await activityService.update(userId, id, body);
    return createResponse(entry);
  },
);

// DELETE /activities/{date}/{id} - Delete activity entry
const handleDeleteActivity: RouteHandler = async (event, userId) => {
  const { date, id } = event.pathParameters || {};

  if (!date || !id) {
    return createErrorResponse("Date and entry ID are required", 400);
  }

  if (!isValidDateFormat(date)) {
    return createErrorResponse("Invalid date format. Use YYYY-MM-DD", 400);
  }

  const container = createRequestContainer(userId);
  const activityService = container.get(ActivityService);
  await activityService.delete(userId, id);
  return createResponse({ message: "Activity deleted successfully" });
};

// DELETE /account - Delete all user data and Clerk account
const handleDeleteAccount: RouteHandler = async (_event, userId) => {
  const container = createRequestContainer(userId);
  const accountService = container.get(AccountService);
  await accountService.deleteAccount(userId);
  return createResponse({ message: "Account deleted" });
};

// =============================================================================
// Route Definitions
// =============================================================================

export const routes: Route[] = [
  // Queries
  {
    method: "GET",
    pattern: /^\/summary$/,
    handler: handleGetSummary,
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
  // Activity queries
  {
    method: "GET",
    pattern: /^\/activities\/[^/]+$/,
    handler: handleGetActivitiesByDate,
  },
  // Activity mutations
  {
    method: "POST",
    pattern: /^\/activities$/,
    handler: handleCreateActivity,
  },
  {
    method: "PUT",
    pattern: /^\/activities\/[^/]+\/[^/]+$/,
    handler: handleUpdateActivity,
  },
  {
    method: "DELETE",
    pattern: /^\/activities\/[^/]+\/[^/]+$/,
    handler: handleDeleteActivity,
  },
  // Account
  {
    method: "DELETE",
    pattern: /^\/account$/,
    handler: handleDeleteAccount,
  },
];
