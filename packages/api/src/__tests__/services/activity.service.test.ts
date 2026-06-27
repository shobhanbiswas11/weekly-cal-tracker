import type { ActivityEntryRepo } from "@/repo/activity-entry.repo.interface";
import { ActivityService } from "@/services/activity.service";
import { TEST_USER_ID, makeActivityEntry } from "../helpers/test-fixtures";

describe("ActivityService", () => {
  let repo: Mocked<ActivityEntryRepo>;
  let service: ActivityService;

  beforeEach(() => {
    repo = mock<ActivityEntryRepo>();
    service = new ActivityService(repo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("create", () => {
    it("delegates to repo and returns created entry", async () => {
      const entry = makeActivityEntry();
      repo.create.mockResolvedValueOnce(entry);

      const result = await service.create(TEST_USER_ID, {
        date: "2025-01-06",
        name: "Running",
        caloriesBurned: 300,
        note: null,
      });

      expect(result).toEqual(entry);
      expect(repo.create).toHaveBeenCalledWith(
        TEST_USER_ID,
        expect.objectContaining({
          name: "Running",
          caloriesBurned: 300,
        }),
      );
    });
  });

  describe("update", () => {
    it("delegates to repo with id and partial data", async () => {
      const updated = makeActivityEntry({ name: "Cycling" });
      repo.update.mockResolvedValueOnce(updated);

      const result = await service.update(TEST_USER_ID, "activity-1", {
        name: "Cycling",
      });

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(TEST_USER_ID, "activity-1", {
        name: "Cycling",
      });
    });
  });

  describe("delete", () => {
    it("delegates to repo", async () => {
      repo.delete.mockResolvedValueOnce(undefined);

      await service.delete(TEST_USER_ID, "activity-1");

      expect(repo.delete).toHaveBeenCalledWith(TEST_USER_ID, "activity-1");
    });
  });

  describe("getById", () => {
    it("returns entry when found", async () => {
      const entry = makeActivityEntry();
      repo.getById.mockResolvedValueOnce(entry);

      const result = await service.getById(TEST_USER_ID, "activity-1");

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
      const entries = [
        makeActivityEntry(),
        makeActivityEntry({ id: "activity-2", name: "Cycling" }),
      ];
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
