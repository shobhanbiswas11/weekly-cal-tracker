import { format, parseISO } from "date-fns";
import type { MealEntry, Profile } from "../entities";
import { getWeekDates } from "../utils/date-utils";
import {
  calculateBMR,
  calculateDailyCalorieBudget,
  calculateNutrientTargets,
  calculateTDEE,
} from "../utils/nutrition-utils";

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  caloriesBurned: number;
}

export interface DailyNutrition {
  date: string;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  netCalories: number; // caloriesConsumed - caloriesBurned
  budget: number;
  balance: number; // budget - netCalories (positive = under budget, negative = over)
  isEstimated: boolean; // true when no meal entries exist; TDEE used as assumed consumption
}

export interface NutrientTargets {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
}

export interface WeeklyNutritionResult {
  // Profile-derived metrics
  bmr: number;
  tdee: number;
  dailyCalorieBudget: number;
  nutrientTargets: NutrientTargets;

  // All 7 dates of the week (Mon–Sun), useful for rendering full week UI
  weekDates: string[];

  weeklyCalorieBudget: number; // dailyCalorieBudget * days.length

  // Weekly consumption totals
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number; // from activity entries
  netCalories: number; // totalCaloriesConsumed - totalCaloriesBurned

  // Weekly progress
  weeklyBalance: number; // weeklyCalorieBudget - netCalories
  progressPercentage: number; // netCalories / weeklyCalorieBudget * 100

  // Per-day breakdown sorted ascending (future days excluded)
  days: DailyNutrition[];
}

export function calculateWeeklyNutrition(
  mealEntries: MealEntry[],
  activityEntries: ActivityEntry[],
  profile: Profile,
  today: string, // YYYY-MM-DD
): WeeklyNutritionResult {
  // 1. Derive calorie targets from profile
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const dailyCalorieBudget = calculateDailyCalorieBudget(tdee, profile.goal);
  const nutrientTargets = calculateNutrientTargets(
    dailyCalorieBudget,
    profile.biologicalSex,
  );

  // 2. Derive the full week (Mon–Sun) from today
  const weekId = format(parseISO(today), "RRRR-'W'II");
  const weekDates = getWeekDates(weekId);

  // 3. Index entries by date
  const mealsByDate = new Map<string, MealEntry[]>();
  for (const entry of mealEntries) {
    const existing = mealsByDate.get(entry.date) ?? [];
    existing.push(entry);
    mealsByDate.set(entry.date, existing);
  }

  const activitiesByDate = new Map<string, ActivityEntry[]>();
  for (const entry of activityEntries) {
    const existing = activitiesByDate.get(entry.date) ?? [];
    existing.push(entry);
    activitiesByDate.set(entry.date, existing);
  }

  // 4. Build per-day nutrition
  //    - Past/today without meals → assume maintenance (TDEE), marked as estimated
  //    - Future dates → skip entirely
  const days: DailyNutrition[] = [];

  for (const date of weekDates) {
    if (date > today) continue; // future: skip

    const meals = mealsByDate.get(date) ?? [];
    const activities = activitiesByDate.get(date) ?? [];
    const caloriesBurned = activities.reduce(
      (sum, a) => sum + a.caloriesBurned,
      0,
    );

    const isEstimated = meals.length === 0;
    const caloriesConsumed = isEstimated
      ? tdee
      : meals.reduce((sum, m) => sum + m.calories, 0);

    const netCalories = caloriesConsumed - caloriesBurned;
    days.push({
      date,
      protein: isEstimated ? 0 : meals.reduce((sum, m) => sum + m.protein, 0),
      carbs: isEstimated ? 0 : meals.reduce((sum, m) => sum + m.carbs, 0),
      fats: isEstimated ? 0 : meals.reduce((sum, m) => sum + m.fats, 0),
      fiber: isEstimated ? 0 : meals.reduce((sum, m) => sum + m.fiber, 0),
      sodium: isEstimated ? 0 : meals.reduce((sum, m) => sum + m.sodium, 0),
      caloriesConsumed,
      caloriesBurned,
      netCalories,
      budget: dailyCalorieBudget,
      balance: dailyCalorieBudget - netCalories,
      isEstimated,
    });
  }

  // 5. Aggregate weekly totals
  const weeklyCalorieBudget = dailyCalorieBudget * days.length;
  const totalCaloriesConsumed = days.reduce(
    (sum, d) => sum + d.caloriesConsumed,
    0,
  );
  const totalCaloriesBurned = days.reduce(
    (sum, d) => sum + d.caloriesBurned,
    0,
  );
  const netCalories = totalCaloriesConsumed - totalCaloriesBurned;
  const weeklyBalance = weeklyCalorieBudget - netCalories;
  const progressPercentage =
    weeklyCalorieBudget > 0
      ? Math.round((netCalories / weeklyCalorieBudget) * 100)
      : 0;

  return {
    bmr,
    tdee,
    dailyCalorieBudget,
    nutrientTargets,
    weekDates,
    weeklyCalorieBudget,
    totalCaloriesConsumed,
    totalCaloriesBurned,
    netCalories,
    weeklyBalance,
    progressPercentage,
    days,
  };
}

export interface ActivityEntry {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  caloriesBurned: number;
}

export interface DailyNutrition {
  date: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  netCalories: number; // caloriesConsumed - caloriesBurned
  budget: number;
  balance: number; // budget - netCalories (positive = under budget, negative = over)
  isEstimated: boolean; // true when no meal entries exist; TDEE used as assumed consumption
}

export interface WeeklyNutritionResult {
  // Profile-derived metrics
  bmr: number;
  tdee: number;
  dailyCalorieBudget: number;

  weeklyCalorieBudget: number; // dailyCalorieBudget * days.length

  // Weekly consumption totals
  totalCaloriesConsumed: number;
  totalCaloriesBurned: number; // from activity entries
  netCalories: number; // totalCaloriesConsumed - totalCaloriesBurned

  // Weekly progress
  weeklyBalance: number; // weeklyCalorieBudget - netCalories
  progressPercentage: number; // netCalories / weeklyCalorieBudget * 100

  // Per-day breakdown sorted ascending (future days excluded)
  days: DailyNutrition[];
}
