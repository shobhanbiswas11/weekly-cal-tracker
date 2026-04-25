import { InjectionToken } from "@needle-di/core";
import type { MealEntryRepo } from "../repo/meal-entry.repo.interface";
import type { ProfileRepo } from "../repo/profile.repo.interface";
import type { AppConfig } from "./config";

// =============================================================================
// Repository Tokens
// =============================================================================

export const MEAL_ENTRY_REPO = new InjectionToken<MealEntryRepo>(
  "MEAL_ENTRY_REPO",
);
export const PROFILE_REPO = new InjectionToken<ProfileRepo>("PROFILE_REPO");

// =============================================================================
// Auth Token
// =============================================================================
export interface AuthContext {
  userId: string;
}

export const AUTH_CONTEXT = new InjectionToken<AuthContext>("AUTH_CONTEXT");

// =============================================================================
// Config Token
// =============================================================================

export const APP_CONFIG = new InjectionToken<AppConfig>("APP_CONFIG");
