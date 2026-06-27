import { ActivityService } from "@/services/activity.service";
import { AuthService } from "@/services/auth.service";
import { MealService } from "@/services/meal.service";
import { ProfileService } from "@/services/profile.service";
import { QueryService } from "@/services/query.service";
import {
  TEST_USER_ID,
  makeActivityEntry,
  makeMealEntry,
  makeProfile,
} from "../helpers/test-fixtures";

// =============================================================================
// Tests
// =============================================================================

describe("QueryService", () => {
  let profileService: Mocked<ProfileService>;
  let mealService: Mocked<MealService>;
  let activityService: Mocked<ActivityService>;
  let service: QueryService;

  beforeEach(() => {
    profileService = mock<ProfileService>();
    mealService = mock<MealService>();
    activityService = mock<ActivityService>();
    const auth = new AuthService(TEST_USER_ID);
    service = new QueryService(
      auth,
      profileService,
      mealService,
      activityService,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("summary", () => {
    it("returns profile, meals, and activities for the current week", async () => {
      const profile = makeProfile();
      const meals = [makeMealEntry()];
      const activities = [makeActivityEntry()];

      profileService.getByUserId.mockResolvedValueOnce(profile);
      mealService.getByDateRange.mockResolvedValueOnce(meals);
      activityService.getByDateRange.mockResolvedValueOnce(activities);

      const result = await service.summary();

      expect(result.profile).toEqual(profile);
      expect(result.mealEntries).toEqual(meals);
      expect(result.activityEntries).toEqual(activities);
      expect(result.weekId).toMatch(/^\d{4}-W\d{2}$/);
    });

    it("uses provided weekId instead of current week", async () => {
      profileService.getByUserId.mockResolvedValueOnce(null);
      mealService.getByDateRange.mockResolvedValueOnce([]);
      activityService.getByDateRange.mockResolvedValueOnce([]);

      const result = await service.summary("2025-W02");

      expect(result.weekId).toBe("2025-W02");
      // Should query Mon Jan 6 – Sun Jan 12 for 2025-W02
      expect(mealService.getByDateRange).toHaveBeenCalledWith(
        TEST_USER_ID,
        "2025-01-06",
        "2025-01-12",
      );
      expect(activityService.getByDateRange).toHaveBeenCalledWith(
        TEST_USER_ID,
        "2025-01-06",
        "2025-01-12",
      );
    });

    it("returns null profile when user has no profile", async () => {
      profileService.getByUserId.mockResolvedValueOnce(null);
      mealService.getByDateRange.mockResolvedValueOnce([]);
      activityService.getByDateRange.mockResolvedValueOnce([]);

      const result = await service.summary();

      expect(result.profile).toBeNull();
    });

    it("fetches profile, meals, and activities in parallel", async () => {
      const callOrder: string[] = [];

      profileService.getByUserId.mockImplementation(async () => {
        callOrder.push("profile");
        return null;
      });
      mealService.getByDateRange.mockImplementation(async () => {
        callOrder.push("meals");
        return [];
      });
      activityService.getByDateRange.mockImplementation(async () => {
        callOrder.push("activities");
        return [];
      });

      await service.summary();

      // All three should be called (order doesn't matter since they're parallel)
      expect(callOrder).toHaveLength(3);
      expect(callOrder).toContain("profile");
      expect(callOrder).toContain("meals");
      expect(callOrder).toContain("activities");
    });
  });
});
