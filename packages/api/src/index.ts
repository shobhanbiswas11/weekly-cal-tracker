// =============================================================================
// Repository Interfaces
// =============================================================================

export type {
  CreateMealEntry,
  MealEntry,
  MealEntryRepo,
} from "./repo/meal-entry.repo.interface";

export type {
  CreateProfile,
  Profile,
  ProfileRepo,
} from "./repo/profile.repo.interface";

export type { ISODate } from "./repo/types";

// =============================================================================
// Repository Implementations
// =============================================================================

export { DynamoDBMealEntryRepo } from "./repo/meal-entry-dynamodb.repo";
export { DynamoDBProfileRepo } from "./repo/profile-dynamodb.repo";

// =============================================================================
// Dependency Injection
// =============================================================================

export {
  AUTH_CONTEXT,
  MEAL_ENTRY_REPO,
  PROFILE_REPO,
  type AuthContext,
} from "./di/tokens";

export { createRequestContainer, getRootContainer, initContainer } from "./di";

// =============================================================================
// Services
// =============================================================================

export { ChatService } from "./services/chat.service";

// =============================================================================
// Tools
// =============================================================================
