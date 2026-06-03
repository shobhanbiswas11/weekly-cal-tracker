import {
  ActivityService,
  MealService,
  ProfileService,
  QueryService,
  createRequestContainer,
} from "@weekly-cal/api";
import {
  isValidDateFormat,
  isValidWeekFormat,
  schemaCreateActivityEntry,
  schemaCreateMealEntry,
  schemaCreateProfile,
  schemaUpdateActivityEntry,
  schemaUpdateMealEntry,
  schemaUpdateProfile,
} from "@weekly-cal/core";
import { Router, type Response } from "express";

const router = Router();

const getUserId = () => process.env.TEST_USER_ID || "test-user";

const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });

const err = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, error: message });

// GET /summary?weekId=2026-W23 (optional)
router.get("/summary", async (req, res) => {
  const weekId = req.query.weekId as string | undefined;

  if (weekId && !isValidWeekFormat(weekId)) {
    return err(res, "Invalid week format. Use YYYY-Www (e.g., 2026-W13)");
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const queryService = container.get(QueryService);
  const summary = await queryService.summary(weekId);
  ok(res, summary);
});

// GET /entries/:date
router.get("/entries/:date", async (req, res) => {
  const { date } = req.params;

  if (!isValidDateFormat(date)) {
    return err(res, "Invalid date format. Use YYYY-MM-DD");
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  const entries = await mealService.getByDate(userId, date);
  ok(res, { entries });
});

// POST /entries
router.post("/entries", async (req, res) => {
  const result = schemaCreateMealEntry.safeParse(req.body);
  if (!result.success) {
    return err(res, `Invalid request body: ${result.error.message}`);
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  const entry = await mealService.create(userId, result.data);
  ok(res, entry, 201);
});

// PUT /entries/:date/:id
router.put("/entries/:date/:id", async (req, res) => {
  const { date, id } = req.params;

  if (!isValidDateFormat(date)) {
    return err(res, "Invalid date format. Use YYYY-MM-DD");
  }

  const result = schemaUpdateMealEntry.safeParse(req.body);
  if (!result.success) {
    return err(res, `Invalid request body: ${result.error.message}`);
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  const entry = await mealService.update(userId, id, result.data);
  ok(res, entry);
});

// DELETE /entries/:date/:id
router.delete("/entries/:date/:id", async (req, res) => {
  const { date, id } = req.params;

  if (!isValidDateFormat(date)) {
    return err(res, "Invalid date format. Use YYYY-MM-DD");
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const mealService = container.get(MealService);
  await mealService.delete(userId, id);
  ok(res, { message: "Entry deleted successfully" });
});

// POST /profile
router.post("/profile", async (req, res) => {
  const result = schemaCreateProfile.safeParse(req.body);
  if (!result.success) {
    return err(res, `Invalid request body: ${result.error.message}`);
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const profileService = container.get(ProfileService);
  const profile = await profileService.create(userId, result.data);
  ok(res, { profile }, 201);
});

// PUT /profile
router.put("/profile", async (req, res) => {
  const result = schemaUpdateProfile.safeParse(req.body);
  if (!result.success) {
    return err(res, `Invalid request body: ${result.error.message}`);
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const profileService = container.get(ProfileService);
  const profile = await profileService.update(userId, result.data);
  ok(res, { profile });
});

// GET /activities/:date
router.get("/activities/:date", async (req, res) => {
  const { date } = req.params;

  if (!isValidDateFormat(date)) {
    return err(res, "Invalid date format. Use YYYY-MM-DD");
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const activityService = container.get(ActivityService);
  const entries = await activityService.getByDate(userId, date);
  ok(res, { entries });
});

// POST /activities
router.post("/activities", async (req, res) => {
  const result = schemaCreateActivityEntry.safeParse(req.body);
  if (!result.success) {
    return err(res, `Invalid request body: ${result.error.message}`);
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const activityService = container.get(ActivityService);
  const entry = await activityService.create(userId, result.data);
  ok(res, entry, 201);
});

// PUT /activities/:date/:id
router.put("/activities/:date/:id", async (req, res) => {
  const { date, id } = req.params;

  if (!isValidDateFormat(date)) {
    return err(res, "Invalid date format. Use YYYY-MM-DD");
  }

  const result = schemaUpdateActivityEntry.safeParse(req.body);
  if (!result.success) {
    return err(res, `Invalid request body: ${result.error.message}`);
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const activityService = container.get(ActivityService);
  const entry = await activityService.update(userId, id, result.data);
  ok(res, entry);
});

// DELETE /activities/:date/:id
router.delete("/activities/:date/:id", async (req, res) => {
  const { date, id } = req.params;

  if (!isValidDateFormat(date)) {
    return err(res, "Invalid date format. Use YYYY-MM-DD");
  }

  const userId = getUserId();
  const container = createRequestContainer(userId);
  const activityService = container.get(ActivityService);
  await activityService.delete(userId, id);
  ok(res, { message: "Activity deleted successfully" });
});

export default router;
