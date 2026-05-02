import { MealEntry, Profile } from "../entities";

export interface QueryResponseSummary {
  profile: Profile;
  weekId: string; // e.g., "2024-W27"
  mealEntries: MealEntry[];
}
