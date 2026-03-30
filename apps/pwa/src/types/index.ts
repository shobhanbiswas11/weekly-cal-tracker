// Types aligned with backend API

export interface CalorieEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string; // ISO 8601
  rawInput?: string;
}

export interface DailySummary {
  date: string;
  entries: CalorieEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  days: DailySummary[];
  weeklyTotalCalories: number;
  weeklyTotalProtein: number;
  weeklyTotalCarbs: number;
  weeklyTotalFat: number;
  averageDailyCalories: number;
}

export interface ParseEntryRequest {
  input: string;
  date?: string;
}

export interface ParseEntryResponse {
  entries: CalorieEntry[];
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
