import {
  getCurrentWeekId,
  getWeekBoundaries,
  type ResponseSummary,
} from "@weekly-cal/core";
import { inject, injectable } from "../di-utils";
import { ActivityService } from "./activity.service";
import { AuthService } from "./auth.service";
import { MealService } from "./meal.service";
import { ProfileService } from "./profile.service";

@injectable()
export class QueryService {
  constructor(
    private auth = inject(AuthService),
    private profileService = inject(ProfileService),
    private mealService = inject(MealService),
    private activityService = inject(ActivityService),
  ) {}

  async summary(weekId?: string): Promise<ResponseSummary> {
    const userId = this.auth.userId;
    const resolvedWeekId = weekId ?? getCurrentWeekId();
    const { start: weekStart, end: weekEnd } =
      getWeekBoundaries(resolvedWeekId);

    const [profile, mealEntries, activityEntries] = await Promise.all([
      this.profileService.getByUserId(userId),
      this.mealService.getByDateRange(userId, weekStart, weekEnd),
      this.activityService.getByDateRange(userId, weekStart, weekEnd),
    ]);

    return { profile, weekId: resolvedWeekId, mealEntries, activityEntries };
  }
}
