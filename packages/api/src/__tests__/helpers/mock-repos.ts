import type { ActivityEntryRepo } from "@/repo/activity-entry.repo.interface";
import type { MealEntryRepo } from "@/repo/meal-entry.repo.interface";
import type { ProfileRepo } from "@/repo/profile.repo.interface";

export const createMockMealEntryRepo = () => mock<MealEntryRepo>();
export const createMockActivityEntryRepo = () => mock<ActivityEntryRepo>();
export const createMockProfileRepo = () => mock<ProfileRepo>();
