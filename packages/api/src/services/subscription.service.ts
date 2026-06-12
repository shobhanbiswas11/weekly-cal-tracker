import {
  FREE_TIER_CHAT_LIMIT,
  REVENUECAT_ENTITLEMENT_ID,
} from "@weekly-cal/core";
import { inject, injectable } from "../di-utils";
import {
  PROFILE_REPO_TOKEN,
  type ProfileRepo,
} from "../repo/profile.repo.interface";
import { AppConfigService } from "./app-config.service";
import { AuthService } from "./auth.service";

// =============================================================================
// SubscriptionService
// =============================================================================

export interface ChatAccess {
  allowed: boolean;
  reason?: "pro" | "free_within_limit" | "limit_reached";
  chatMessageCount?: number;
  limit?: number;
}

@injectable()
export class SubscriptionService {
  constructor(
    private auth = inject(AuthService),
    private config = inject(AppConfigService),
    private profileRepo: ProfileRepo = inject(PROFILE_REPO_TOKEN),
  ) {}

  /**
   * Check if the user has an active Pro subscription via RevenueCat REST API.
   */
  async isProUser(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${this.auth.userId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.revenuecatSecretKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        // If subscriber doesn't exist in RevenueCat, they're not Pro
        if (response.status === 404) return false;
        console.error(
          "RevenueCat API error:",
          response.status,
          await response.text(),
        );
        return false;
      }

      const data = await response.json();
      const entitlements = data?.subscriber?.entitlements;

      if (!entitlements || !entitlements[REVENUECAT_ENTITLEMENT_ID]) {
        return false;
      }

      // Check if entitlement is still active (not expired)
      const entitlement = entitlements[REVENUECAT_ENTITLEMENT_ID];
      const expiresDate = entitlement.expires_date;

      if (!expiresDate) return true; // Lifetime entitlement
      return new Date(expiresDate) > new Date();
    } catch (error) {
      console.error("Failed to check RevenueCat subscription:", error);
      return false;
    }
  }

  /**
   * Check if the user is allowed to send a chat message.
   * Pro users: always allowed.
   * Free users: allowed if under the free tier limit.
   */
  async checkChatAccess(): Promise<ChatAccess> {
    const isPro = await this.isProUser();

    if (isPro) {
      return { allowed: true, reason: "pro" };
    }

    // Free user — check message count
    const profile = await this.profileRepo.getSelectedFieldsByUserId(
      this.auth.userId,
      ["chatMessageCount"],
    );

    const chatMessageCount = profile?.chatMessageCount ?? 0;

    if (chatMessageCount >= FREE_TIER_CHAT_LIMIT) {
      return {
        allowed: false,
        reason: "limit_reached",
        chatMessageCount,
        limit: FREE_TIER_CHAT_LIMIT,
      };
    }

    return {
      allowed: true,
      reason: "free_within_limit",
      chatMessageCount,
      limit: FREE_TIER_CHAT_LIMIT,
    };
  }

  /**
   * Increment the user's chat message count. Call after a successful AI response.
   */
  async incrementChatMessageCount(): Promise<number> {
    return this.profileRepo.incrementChatMessageCount(this.auth.userId);
  }
}
