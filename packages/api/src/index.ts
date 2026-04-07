// =============================================================================
// Repository Interfaces
// =============================================================================

export type {
  MealEntry,
  CreateMealEntry,
  MealEntryRepo,
} from "./repo/meal-entry.repo.interface";

export type {
  Profile,
  CreateProfile,
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
  MEAL_ENTRY_REPO,
  PROFILE_REPO,
  AUTH_CONTEXT,
  type AuthContext,
} from "./services/tokens";

export { rootContainer, createRequestContainer } from "./services/container";

// =============================================================================
// Services
// =============================================================================

export { ChatService } from "./services/chat.service";
