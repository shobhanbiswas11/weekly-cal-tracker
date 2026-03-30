// Core calorie tracking types

export interface CalorieEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  entries: CalorieEntry[];
  totals: MacroTotals;
  calorieGoal: number;
  caloriesRemaining: number;
}

export interface WeeklySummary {
  weekId: string; // 2026-W13
  startDate: string; // Monday YYYY-MM-DD
  endDate: string; // Sunday YYYY-MM-DD
  days: DailySummary[];
  weeklyTotals: MacroTotals;
  weeklyCalorieGoal: number;
  weeklyCaloriesRemaining: number;
  averageDailyCalories: number;
}

export interface UserGoals {
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

// Default goals (can be overridden by user settings later)
export const DEFAULT_GOALS: UserGoals = {
  dailyCalorieGoal: 2000,
  proteinGoal: 150,
  carbsGoal: 250,
  fatGoal: 65,
};

export type MacroType =
  | "calories"
  | "protein"
  | "carbs"
  | "fat"
  | "fiber"
  | "sugar"
  | "sodium";
