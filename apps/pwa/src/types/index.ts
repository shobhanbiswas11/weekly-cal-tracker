export interface CalorieEntry {
  id: string;
  name: string;
  calories: number;
  timestamp: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  entries: CalorieEntry[];
  totalCalories: number;
}

export interface WeeklyData {
  startDate: string; // YYYY-MM-DD format (Monday)
  days: DailyLog[];
  weeklyTotal: number;
  weeklyGoal: number;
}
