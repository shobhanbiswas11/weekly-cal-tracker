import { InjectionToken } from "@needle-di/core";
import type { MealEntryRepo } from "../repo/meal-entry.repo.interface";
import type { ProfileRepo } from "../repo/profile.repo.interface";

// =============================================================================
// Repository Tokens
// =============================================================================

/**
 * Injection token for MealEntryRepo interface.
 * Allows swapping implementations (DynamoDB, InMemory, etc.)
 */
export const MEAL_ENTRY_REPO = new InjectionToken<MealEntryRepo>(
  "MEAL_ENTRY_REPO",
);

/**
 * Injection token for ProfileRepo interface.
 * Allows swapping implementations (DynamoDB, InMemory, etc.)
 */
export const PROFILE_REPO = new InjectionToken<ProfileRepo>("PROFILE_REPO");

// =============================================================================
// Auth Token
// =============================================================================

/**
 * Auth context injected per request.
 * Contains the authenticated user's ID.
 */
export interface AuthContext {
  userId: string;
}

export const AUTH_CONTEXT = new InjectionToken<AuthContext>("AUTH_CONTEXT");
