import { Container } from "./di-utils";
import {
  ACTIVITY_ENTRY_REPO_TOKEN,
  DynamoDBActivityEntryRepo,
  DynamoDBMealEntryRepo,
  DynamoDBProfileRepo,
  MEAL_ENTRY_REPO_TOKEN,
  PROFILE_REPO_TOKEN,
} from "./repo";
import { AuthService } from "./services";

let rootContainer: Container;

export function initContainer(): void {
  rootContainer = new Container();

  rootContainer.bind({
    provide: MEAL_ENTRY_REPO_TOKEN,
    useClass: DynamoDBMealEntryRepo,
  });

  rootContainer.bind({
    provide: PROFILE_REPO_TOKEN,
    useClass: DynamoDBProfileRepo,
  });

  rootContainer.bind({
    provide: ACTIVITY_ENTRY_REPO_TOKEN,
    useClass: DynamoDBActivityEntryRepo,
  });
}

function checkContainerInitialized(): void {
  if (!rootContainer) {
    throw new Error("Container not initialized. Call initContainer() first.");
  }
}

export function createRequestContainer(userId: string): Container {
  checkContainerInitialized();

  const requestContainer = rootContainer.createChild();

  // Bind request-scoped auth context
  requestContainer.bind({
    provide: AuthService,
    useValue: new AuthService(userId),
  });

  return requestContainer;
}

export function getRootContainer(): Container {
  checkContainerInitialized();
  return rootContainer;
}
