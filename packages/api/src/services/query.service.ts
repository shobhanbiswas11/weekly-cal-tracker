import { ResponseSummary } from "@weekly-cal/core";
import {
  endOfISOWeek,
  format,
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
} from "date-fns";
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

  async summary(): Promise<ResponseSummary> {
    const userId = this.auth.userId;
    const today = new Date();
    const weekStart = format(startOfISOWeek(today), "yyyy-MM-dd");
    const weekEnd = format(endOfISOWeek(today), "yyyy-MM-dd");
    const weekId = `${getISOWeekYear(today)}-W${String(getISOWeek(today)).padStart(2, "0")}`;

    const [profile, mealEntries, activityEntries] = await Promise.all([
      this.profileService.getByUserId(userId),
      this.mealService.getByDateRange(userId, weekStart, weekEnd),
      this.activityService.getByDateRange(userId, weekStart, weekEnd),
    ]);

    return { profile, weekId, mealEntries, activityEntries };
  }
}
