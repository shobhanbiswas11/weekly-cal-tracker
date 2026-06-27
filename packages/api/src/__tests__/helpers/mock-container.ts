import { Container } from "@/di-utils";
import {
  ACTIVITY_ENTRY_REPO_TOKEN,
  type ActivityEntryRepo,
} from "@/repo/activity-entry.repo.interface";
import {
  MEAL_ENTRY_REPO_TOKEN,
  type MealEntryRepo,
} from "@/repo/meal-entry.repo.interface";
import {
  PROFILE_REPO_TOKEN,
  type ProfileRepo,
} from "@/repo/profile.repo.interface";
import { AppConfigService } from "@/services/app-config.service";
import { AuthService } from "@/services/auth.service";
import {
  createMockActivityEntryRepo,
  createMockMealEntryRepo,
  createMockProfileRepo,
} from "./mock-repos";
import { TEST_USER_ID, testEnv } from "./test-fixtures";

export interface TestContainer {
  container: Container;
  mockMealEntryRepo: MealEntryRepo;
  mockActivityEntryRepo: ActivityEntryRepo;
  mockProfileRepo: ProfileRepo;
}

/**
 * Creates a DI container wired with mock repos and a test AuthService.
 * Use this for integration-style tests where you want real services
 * but mock the data layer.
 */
export function createTestContainer(
  userId: string = TEST_USER_ID,
  env: Record<string, string> = testEnv,
): TestContainer {
  const container = new Container();

  const mockMealEntryRepo = createMockMealEntryRepo();
  const mockActivityEntryRepo = createMockActivityEntryRepo();
  const mockProfileRepo = createMockProfileRepo();

  container.bind({
    provide: MEAL_ENTRY_REPO_TOKEN,
    useValue: mockMealEntryRepo,
  });
  container.bind({
    provide: ACTIVITY_ENTRY_REPO_TOKEN,
    useValue: mockActivityEntryRepo,
  });
  container.bind({ provide: PROFILE_REPO_TOKEN, useValue: mockProfileRepo });
  container.bind({ provide: AuthService, useValue: new AuthService(userId) });
  container.bind({
    provide: AppConfigService,
    useValue: new AppConfigService(env as unknown as NodeJS.ProcessEnv),
  });

  return {
    container,
    mockMealEntryRepo,
    mockActivityEntryRepo,
    mockProfileRepo,
  };
}
