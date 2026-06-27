import type { ProfileRepo } from "@/repo/profile.repo.interface";
import { ProfileService } from "@/services/profile.service";
import { TEST_USER_ID, makeProfile } from "../helpers/test-fixtures";

describe("ProfileService", () => {
  let repo: Mocked<ProfileRepo>;
  let service: ProfileService;

  beforeEach(() => {
    repo = mock<ProfileRepo>();
    service = new ProfileService(repo);
  });

  describe("create", () => {
    it("delegates to repo and returns created profile", async () => {
      const profile = makeProfile();
      repo.create.mockResolvedValueOnce(profile);

      const input = {
        name: "Test User",
        dateOfBirth: "1990-01-01",
        biologicalSex: "Male" as const,
        height: 175,
        weight: 80,
        activityLevel: "Moderately Active" as const,
        goal: "Maintain Healthy Lifestyle" as const,
      };
      const result = await service.create(TEST_USER_ID, input);

      expect(result).toEqual(profile);
      expect(repo.create).toHaveBeenCalledWith(TEST_USER_ID, input);
    });
  });

  describe("update", () => {
    it("delegates to repo with partial data", async () => {
      const updated = makeProfile({ name: "Updated Name" });
      repo.update.mockResolvedValueOnce(updated);

      const result = await service.update(TEST_USER_ID, {
        name: "Updated Name",
      });

      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith(TEST_USER_ID, {
        name: "Updated Name",
      });
    });
  });

  describe("delete", () => {
    it("delegates to repo", async () => {
      repo.delete.mockResolvedValueOnce(undefined);

      await service.delete(TEST_USER_ID);

      expect(repo.delete).toHaveBeenCalledWith(TEST_USER_ID);
    });
  });

  describe("getByUserId", () => {
    it("returns profile when found", async () => {
      const profile = makeProfile();
      repo.getByUserId.mockResolvedValueOnce(profile);

      const result = await service.getByUserId(TEST_USER_ID);

      expect(result).toEqual(profile);
    });

    it("returns null when not found", async () => {
      repo.getByUserId.mockResolvedValueOnce(null);

      const result = await service.getByUserId(TEST_USER_ID);

      expect(result).toBeNull();
    });
  });

  describe("getSelectedFields", () => {
    it("delegates to repo with field list", async () => {
      repo.getSelectedFieldsByUserId.mockResolvedValueOnce({
        chatMessageCount: 5,
      } as any);

      const result = await service.getSelectedFields(TEST_USER_ID, [
        "chatMessageCount",
      ]);

      expect(result).toEqual({ chatMessageCount: 5 });
      expect(repo.getSelectedFieldsByUserId).toHaveBeenCalledWith(
        TEST_USER_ID,
        ["chatMessageCount"],
      );
    });

    it("returns null when profile not found", async () => {
      repo.getSelectedFieldsByUserId.mockResolvedValueOnce(null);

      const result = await service.getSelectedFields(TEST_USER_ID, ["name"]);

      expect(result).toBeNull();
    });
  });
});
