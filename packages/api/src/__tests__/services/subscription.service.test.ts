import type { ProfileRepo } from "@/repo/profile.repo.interface";
import { AppConfigService } from "@/services/app-config.service";
import { AuthService } from "@/services/auth.service";
import { SubscriptionService } from "@/services/subscription.service";
import { FREE_TIER_CHAT_LIMIT } from "@weekly-cal/core";
import { TEST_USER_ID, testEnv } from "../helpers/test-fixtures";

// =============================================================================
// Helpers
// =============================================================================

function createService(profileRepo: ProfileRepo): SubscriptionService {
  const auth = new AuthService(TEST_USER_ID);
  const config = new AppConfigService(testEnv as unknown as NodeJS.ProcessEnv);
  return new SubscriptionService(auth, config, profileRepo);
}

function mockFetchResponse(data: unknown, status = 200): void {
  vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

function mockFetchError(status: number, body = "Error"): void {
  vi.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(body, { status }),
  );
}

function mockFetchNetworkError(): void {
  vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));
}

function makeRevenueCatResponse(
  entitlementId: string,
  expiresDate: string | null,
) {
  return {
    subscriber: {
      entitlements: {
        [entitlementId]: {
          expires_date: expiresDate,
          product_identifier: "rc_pro_monthly",
          purchase_date: "2025-01-01T00:00:00Z",
        },
      },
    },
  };
}

// =============================================================================
// Tests
// =============================================================================

describe("SubscriptionService", () => {
  let profileRepo: Mocked<ProfileRepo>;
  let service: SubscriptionService;

  beforeEach(() => {
    profileRepo = mock<ProfileRepo>();
    service = createService(profileRepo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // isProUser
  // ===========================================================================

  describe("isProUser", () => {
    it("returns true for active Pro subscription", async () => {
      const futureDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      mockFetchResponse(
        makeRevenueCatResponse("Weekly Health Pro", futureDate),
      );

      const result = await service.isProUser();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `https://api.revenuecat.com/v1/subscribers/${TEST_USER_ID}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${testEnv.REVENUECAT_SECRET_KEY}`,
          }),
        }),
      );
    });

    it("returns true for lifetime entitlement (no expiry)", async () => {
      mockFetchResponse(makeRevenueCatResponse("Weekly Health Pro", null));

      expect(await service.isProUser()).toBe(true);
    });

    it("returns false for expired Pro subscription", async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      mockFetchResponse(makeRevenueCatResponse("Weekly Health Pro", pastDate));

      expect(await service.isProUser()).toBe(false);
    });

    it("returns false when no entitlements exist", async () => {
      mockFetchResponse({ subscriber: { entitlements: {} } });

      expect(await service.isProUser()).toBe(false);
    });

    it("returns false when entitlement object is missing", async () => {
      mockFetchResponse({ subscriber: {} });

      expect(await service.isProUser()).toBe(false);
    });

    it("returns false for 404 (user not in RevenueCat)", async () => {
      mockFetchError(404);

      expect(await service.isProUser()).toBe(false);
    });

    it("returns false on RevenueCat API error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetchError(500, "Internal Server Error");

      expect(await service.isProUser()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "RevenueCat API error:",
        500,
        "Internal Server Error",
      );
    });

    it("returns false on network error", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetchNetworkError();

      expect(await service.isProUser()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to check RevenueCat subscription:",
        expect.any(Error),
      );
    });
  });

  // ===========================================================================
  // checkChatAccess
  // ===========================================================================

  describe("checkChatAccess", () => {
    it("allows Pro user without checking message count", async () => {
      const futureDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      mockFetchResponse(
        makeRevenueCatResponse("Weekly Health Pro", futureDate),
      );

      const access = await service.checkChatAccess();

      expect(access).toEqual({ allowed: true, reason: "pro" });
      // Should NOT query profile for free tier check
      expect(profileRepo.getSelectedFieldsByUserId).not.toHaveBeenCalled();
    });

    it("allows free user under message limit", async () => {
      mockFetchResponse({ subscriber: { entitlements: {} } });
      profileRepo.getSelectedFieldsByUserId.mockResolvedValueOnce({
        chatMessageCount: 5,
      });

      const access = await service.checkChatAccess();

      expect(access).toEqual({
        allowed: true,
        reason: "free_within_limit",
        chatMessageCount: 5,
        limit: FREE_TIER_CHAT_LIMIT,
      });
    });

    it("denies free user at message limit", async () => {
      mockFetchResponse({ subscriber: { entitlements: {} } });
      profileRepo.getSelectedFieldsByUserId.mockResolvedValueOnce({
        chatMessageCount: FREE_TIER_CHAT_LIMIT,
      });

      const access = await service.checkChatAccess();

      expect(access).toEqual({
        allowed: false,
        reason: "limit_reached",
        chatMessageCount: FREE_TIER_CHAT_LIMIT,
        limit: FREE_TIER_CHAT_LIMIT,
      });
    });

    it("denies free user over message limit", async () => {
      mockFetchResponse({ subscriber: { entitlements: {} } });
      profileRepo.getSelectedFieldsByUserId.mockResolvedValueOnce({
        chatMessageCount: FREE_TIER_CHAT_LIMIT + 10,
      });

      const access = await service.checkChatAccess();

      expect(access.allowed).toBe(false);
      expect(access.reason).toBe("limit_reached");
    });

    it("treats null profile as 0 messages (allows access)", async () => {
      mockFetchResponse({ subscriber: { entitlements: {} } });
      profileRepo.getSelectedFieldsByUserId.mockResolvedValueOnce(null);

      const access = await service.checkChatAccess();

      expect(access).toEqual({
        allowed: true,
        reason: "free_within_limit",
        chatMessageCount: 0,
        limit: FREE_TIER_CHAT_LIMIT,
      });
    });

    it("allows free user at limit - 1", async () => {
      mockFetchResponse({ subscriber: { entitlements: {} } });
      profileRepo.getSelectedFieldsByUserId.mockResolvedValueOnce({
        chatMessageCount: FREE_TIER_CHAT_LIMIT - 1,
      });

      const access = await service.checkChatAccess();

      expect(access.allowed).toBe(true);
      expect(access.reason).toBe("free_within_limit");
    });
  });

  // ===========================================================================
  // incrementChatMessageCount
  // ===========================================================================

  describe("incrementChatMessageCount", () => {
    it("delegates to profileRepo and returns new count", async () => {
      profileRepo.incrementChatMessageCount.mockResolvedValueOnce(6);

      const result = await service.incrementChatMessageCount();

      expect(result).toBe(6);
      expect(profileRepo.incrementChatMessageCount).toHaveBeenCalledWith(
        TEST_USER_ID,
      );
    });
  });
});
