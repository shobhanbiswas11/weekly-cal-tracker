import { Container } from "@needle-di/core";
import { DynamoDBMealEntryRepo } from "../repo/meal-entry-dynamodb.repo";
import { DynamoDBProfileRepo } from "../repo/profile-dynamodb.repo";
import {
  APP_CONFIG,
  AUTH_CONTEXT,
  createAppConfig,
  MEAL_ENTRY_REPO,
  PROFILE_REPO,
} from "./tokens";

// =============================================================================
// Root Container
// =============================================================================

let rootContainer: Container;

/**
 * Initialize the DI container with config from environment.
 * Call this AFTER environment variables are loaded (e.g., after dotenv.config()).
 *
 * @throws {ZodError} if required env vars are missing or invalid
 */
export function initContainer(): void {
  rootContainer = new Container();

  // Bind config values (validates env vars eagerly, throws if missing)
  rootContainer.bind({
    provide: APP_CONFIG,
    useValue: createAppConfig(),
  });

  // Bind DynamoDB implementations to interface tokens
  rootContainer.bind({
    provide: MEAL_ENTRY_REPO,
    useClass: DynamoDBMealEntryRepo,
  });

  rootContainer.bind({
    provide: PROFILE_REPO,
    useClass: DynamoDBProfileRepo,
  });
}

// =============================================================================
// Request Container Factory
// =============================================================================

/**
 * Creates a child container for a single request.
 * Inherits repo singletons from root, adds request-scoped auth context.
 *
 * @param userId - The authenticated user's ID
 * @returns Container with auth context bound
 */
export function createRequestContainer(userId: string): Container {
  if (!rootContainer) {
    throw new Error("Container not initialized. Call initContainer() first.");
  }

  const requestContainer = rootContainer.createChild();

  // Bind request-scoped auth context
  requestContainer.bind({
    provide: AUTH_CONTEXT,
    useValue: { userId },
  });

  return requestContainer;
}

/**
 * Get the root container instance.
 * Useful for testing or advanced scenarios.
 */
export function getRootContainer(): Container {
  if (!rootContainer) {
    throw new Error("Container not initialized. Call initContainer() first.");
  }
  return rootContainer;
}
