import { Container } from "@needle-di/core";
import { DynamoDBMealEntryRepo } from "../repo/meal-entry-dynamodb.repo";
import { DynamoDBProfileRepo } from "../repo/profile-dynamodb.repo";
import { AUTH_CONTEXT, MEAL_ENTRY_REPO, PROFILE_REPO } from "./tokens";

// =============================================================================
// Root Container (Singleton repos)
// =============================================================================

/**
 * Root container with singleton repository bindings.
 * Repos are shared across all requests for connection pooling efficiency.
 */
export const rootContainer = new Container();

// Bind DynamoDB implementations to interface tokens
rootContainer.bind({
  provide: MEAL_ENTRY_REPO,
  useClass: DynamoDBMealEntryRepo,
});

rootContainer.bind({
  provide: PROFILE_REPO,
  useClass: DynamoDBProfileRepo,
});

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
  const requestContainer = rootContainer.createChild();

  // Bind request-scoped auth context
  requestContainer.bind({
    provide: AUTH_CONTEXT,
    useValue: { userId },
  });

  return requestContainer;
}
