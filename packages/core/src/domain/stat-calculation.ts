import type { ActivityEntry, MealEntry, Profile } from "../entities";
import type { DailyStat } from "../entities/daily-stat.vo";
import type { WeeklyStat } from "../entities/weekly-stat.vo";
import { calculateCaloriePlan, getWeekDates } from "../utils";

export interface StatCalculationParams {
  weekId: string;
  today: string;
  profile: Profile;
  mealEntries: MealEntry[];
  activityEntries: ActivityEntry[];
}
export interface StatCalculationResult {
  weekId: string;
  today: string;
  bmr: number;
  tdee: number;
  dailyCalorieBudget: number;
  weeklyStat: WeeklyStat;
  dailyStats: DailyStat[];
}

export function calculateStat({
  weekId,
  today,
  profile,
  mealEntries,
  activityEntries,
}: StatCalculationParams): StatCalculationResult {
  const { bmr, tdee, dailyCalorieBudget } = calculateCaloriePlan(profile);

  const weekDates = getWeekDates(weekId);

  if (!weekDates.includes(today)) {
    throw new Error(`Today (${today}) is not within week ${weekId}`);
  }

  // Group entries by date
  const mealsByDate = new Map<string, MealEntry[]>();
  for (const meal of mealEntries) {
    if (!weekDates.includes(meal.date)) {
      continue; // Ignore meals outside the week
    }
    if (!mealsByDate.has(meal.date)) mealsByDate.set(meal.date, []);
    mealsByDate.get(meal.date)!.push(meal);
  }

  const activitiesByDate = new Map<string, ActivityEntry[]>();
  for (const activity of activityEntries) {
    if (!weekDates.includes(activity.date)) {
      continue; // Ignore activities outside the week
    }
    if (!activitiesByDate.has(activity.date))
      activitiesByDate.set(activity.date, []);
    activitiesByDate.get(activity.date)!.push(activity);
  }

  const daysWithAnyEntry = new Set([
    ...Array.from(mealsByDate.keys()),
    ...Array.from(activitiesByDate.keys()),
  ]);

  const dailyStats: DailyStat[] = Array.from(daysWithAnyEntry).map((date) => {
    const meals = mealsByDate.get(date) ?? [];
    const activities = activitiesByDate.get(date) ?? [];

    const caloriesConsumed = meals.reduce((sum, m) => sum + m.calories, 0);
    const caloriesBurned = activities.reduce(
      (sum, a) => sum + a.caloriesBurned,
      0,
    );
    const nutrientsConsumption = {
      protein: meals.reduce((sum, m) => sum + m.protein, 0),
      carbs: meals.reduce((sum, m) => sum + m.carbs, 0),
      fats: meals.reduce((sum, m) => sum + m.fats, 0),
      fiber: meals.reduce((sum, m) => sum + m.fiber, 0),
      sugar: meals.reduce((sum, m) => sum + m.sugar, 0),
      sodium: meals.reduce((sum, m) => sum + m.sodium, 0),
    };

    return {
      date,
      calorieBudget: dailyCalorieBudget,
      caloriesConsumed,
      caloriesBurned,
      nutrientsConsumption,
    };
  });

  const weeklyDays = weekDates.map((date) => {
    const meals = mealsByDate.get(date) ?? [];
    const activities = activitiesByDate.get(date) ?? [];
    const isPast = date < today;
    const hasNoMealEntries = meals.length === 0;

    // Past days with no entries are estimated using the daily calorie budget.
    // Ongoing days (today + future) with no entries contribute 0.
    const estimated = isPast && hasNoMealEntries;
    const caloriesConsumed = estimated
      ? dailyCalorieBudget
      : meals.reduce((sum, m) => sum + m.calories, 0);
    const caloriesBurned = activities.reduce(
      (sum, a) => sum + a.caloriesBurned,
      0,
    );

    return { date, caloriesConsumed, caloriesBurned, estimated };
  });

  const weeklyStat: WeeklyStat = {
    weekId,
    days: weeklyDays,
    calorieBudget: dailyCalorieBudget * 7,
    caloriesConsumed: weeklyDays.reduce(
      (sum, d) => sum + d.caloriesConsumed,
      0,
    ),
    caloriesBurned: weeklyDays.reduce((sum, d) => sum + d.caloriesBurned, 0),
  };

  return {
    weekId,
    today,
    bmr,
    tdee,
    dailyCalorieBudget,
    weeklyStat,
    dailyStats,
  };
}
