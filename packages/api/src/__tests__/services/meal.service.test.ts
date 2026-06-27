import type { MealEntryRepo } from "@/repo/meal-entry.repo.interface";
import { MealService } from "@/services/meal.service";
import { TEST_USER_ID, makeMealEntry } from "../helpers/test-fixtures";

describe("MealService", () => {
  let repo: Mocked<MealEntryRepo>;
  let service: MealService;

  beforeEach(() => {
    repo = mock<MealEntryRepo>();
    service = new MealService(repo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("create", () => {
    it("delegates to repo and returns created entry", async () => {
      const entry = makeMealEntry();
      repo.create.mockResolvedValueOnce(entry);

      const result = await service.create(TEST_USER_ID, {
        date: "2025-01-06",
        name: "Test Meal",
        calories: 500,
        protein: 30,
        carbs: 50,
        fats: 20,
        fiber: 5,
        sugar: 10,
        sodium: 400,
        note: null,
        foodItems: null,
      });

      expect(result).toEqual(entry);
      expect(repo.create).toHaveBeenCalledWith(
        TEST_USER_ID,
        expect.objectContaining({
          name: "Test Meal",
          calories: 500,
        }),
      );
    });
  });

  describe("update", () => {
    it("delegates to repo with id and partial data", async () => {
      const updated = makeMealEntry({ name: "Updated Meal" });
      repo.update.mockResolvedValueOnce(updated);

      const result = await service.update(TEST_USER_ID, "meal-1", {
        name: "Updated Meal",
      });

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(TEST_USER_ID, "meal-1", {
        name: "Updated Meal",
      });
    });
  });

  describe("delete", () => {
    it("delegates to repo", async () => {
      repo.delete.mockResolvedValueOnce(undefined);

      await service.delete(TEST_USER_ID, "meal-1");

      expect(repo.delete).toHaveBeenCalledWith(TEST_USER_ID, "meal-1");
    });
  });

  describe("getById", () => {
    it("returns entry when found", async () => {
      const entry = makeMealEntry();
      repo.getById.mockResolvedValueOnce(entry);

      const result = await service.getById(TEST_USER_ID, "meal-1");

      expect(result).toEqual(entry);
    });

    it("returns null when not found", async () => {
      repo.getById.mockResolvedValueOnce(null);

      const result = await service.getById(TEST_USER_ID, "nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getByDate", () => {
    it("returns entries for a date", async () => {
      const entries = [makeMealEntry(), makeMealEntry({ id: "meal-2" })];
      repo.getByDate.mockResolvedValueOnce(entries);

      const result = await service.getByDate(TEST_USER_ID, "2025-01-06");

      expect(result).toEqual(entries);
      expect(repo.getByDate).toHaveBeenCalledWith(TEST_USER_ID, "2025-01-06");
    });
  });

  describe("getByDateRange", () => {
    it("passes start and end dates to repo", async () => {
      repo.getByDateRange.mockResolvedValueOnce([]);

      await service.getByDateRange(TEST_USER_ID, "2025-01-06", "2025-01-12");

      expect(repo.getByDateRange).toHaveBeenCalledWith(
        TEST_USER_ID,
        "2025-01-06",
        "2025-01-12",
      );
    });

    it("works without end date", async () => {
      repo.getByDateRange.mockResolvedValueOnce([]);

      await service.getByDateRange(TEST_USER_ID, "2025-01-06");

      expect(repo.getByDateRange).toHaveBeenCalledWith(
        TEST_USER_ID,
        "2025-01-06",
        undefined,
      );
    });
  });
});
