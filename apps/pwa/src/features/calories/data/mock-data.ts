// Mock data for development - will be replaced with real API calls later

import type {
  CalorieEntry,
  DailySummary,
  MacroTotals,
  WeeklySummary,
} from "../types";
import { addDays, formatDateToISO, getWeekRange } from "../utils";

// Helper to generate UUIDs
function uuid(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Mock entries for the current week (March 23-29, 2026)
// Today is March 30, 2026 (Monday of week 14)
const mockEntries: CalorieEntry[] = [
  // Monday March 23
  {
    id: uuid(),
    date: "2026-03-23",
    time: "08:15",
    name: "Oatmeal with banana and almonds",
    calories: 380,
    protein: 12,
    carbs: 58,
    fat: 14,
    fiber: 8,
    sugar: 18,
  },
  {
    id: uuid(),
    date: "2026-03-23",
    time: "12:30",
    name: "Chickpea curry with rice",
    calories: 520,
    protein: 18,
    carbs: 72,
    fat: 16,
    fiber: 12,
    sugar: 6,
  },
  {
    id: uuid(),
    date: "2026-03-23",
    time: "15:00",
    name: "Greek yogurt with honey",
    calories: 180,
    protein: 15,
    carbs: 22,
    fat: 4,
    fiber: 0,
    sugar: 20,
  },
  {
    id: uuid(),
    date: "2026-03-23",
    time: "19:30",
    name: "Grilled tofu stir-fry",
    calories: 450,
    protein: 28,
    carbs: 35,
    fat: 22,
    fiber: 6,
    sugar: 8,
  },

  // Tuesday March 24
  {
    id: uuid(),
    date: "2026-03-24",
    time: "07:45",
    name: "Scrambled eggs with toast",
    calories: 420,
    protein: 22,
    carbs: 32,
    fat: 24,
    fiber: 3,
    sugar: 4,
  },
  {
    id: uuid(),
    date: "2026-03-24",
    time: "13:00",
    name: "Quinoa salad with feta",
    calories: 480,
    protein: 16,
    carbs: 52,
    fat: 22,
    fiber: 8,
    sugar: 6,
  },
  {
    id: uuid(),
    date: "2026-03-24",
    time: "16:30",
    name: "Apple with peanut butter",
    calories: 280,
    protein: 8,
    carbs: 32,
    fat: 16,
    fiber: 5,
    sugar: 22,
  },
  {
    id: uuid(),
    date: "2026-03-24",
    time: "20:00",
    name: "Lentil soup with bread",
    calories: 380,
    protein: 18,
    carbs: 58,
    fat: 8,
    fiber: 14,
    sugar: 8,
  },

  // Wednesday March 25
  {
    id: uuid(),
    date: "2026-03-25",
    time: "08:00",
    name: "Smoothie bowl",
    calories: 350,
    protein: 14,
    carbs: 52,
    fat: 10,
    fiber: 8,
    sugar: 28,
  },
  {
    id: uuid(),
    date: "2026-03-25",
    time: "12:45",
    name: "Veggie burger with fries",
    calories: 680,
    protein: 22,
    carbs: 78,
    fat: 32,
    fiber: 6,
    sugar: 8,
  },
  {
    id: uuid(),
    date: "2026-03-25",
    time: "19:00",
    name: "Pasta primavera",
    calories: 520,
    protein: 18,
    carbs: 72,
    fat: 18,
    fiber: 8,
    sugar: 10,
  },

  // Thursday March 26
  {
    id: uuid(),
    date: "2026-03-26",
    time: "09:00",
    name: "Avocado toast with eggs",
    calories: 480,
    protein: 18,
    carbs: 38,
    fat: 32,
    fiber: 10,
    sugar: 3,
  },
  {
    id: uuid(),
    date: "2026-03-26",
    time: "13:30",
    name: "Buddha bowl",
    calories: 550,
    protein: 22,
    carbs: 62,
    fat: 24,
    fiber: 14,
    sugar: 12,
  },
  {
    id: uuid(),
    date: "2026-03-26",
    time: "16:00",
    name: "Trail mix",
    calories: 320,
    protein: 10,
    carbs: 28,
    fat: 22,
    fiber: 4,
    sugar: 14,
  },
  {
    id: uuid(),
    date: "2026-03-26",
    time: "20:30",
    name: "Mushroom risotto",
    calories: 580,
    protein: 14,
    carbs: 68,
    fat: 28,
    fiber: 4,
    sugar: 4,
  },

  // Friday March 27
  {
    id: uuid(),
    date: "2026-03-27",
    time: "08:30",
    name: "Pancakes with maple syrup",
    calories: 520,
    protein: 12,
    carbs: 82,
    fat: 18,
    fiber: 2,
    sugar: 38,
  },
  {
    id: uuid(),
    date: "2026-03-27",
    time: "12:00",
    name: "Falafel wrap",
    calories: 580,
    protein: 18,
    carbs: 62,
    fat: 28,
    fiber: 10,
    sugar: 6,
  },
  {
    id: uuid(),
    date: "2026-03-27",
    time: "15:30",
    name: "Protein bar",
    calories: 220,
    protein: 20,
    carbs: 24,
    fat: 8,
    fiber: 4,
    sugar: 6,
  },
  {
    id: uuid(),
    date: "2026-03-27",
    time: "19:45",
    name: "Pizza (2 slices)",
    calories: 540,
    protein: 22,
    carbs: 58,
    fat: 26,
    fiber: 4,
    sugar: 8,
  },

  // Saturday March 28
  {
    id: uuid(),
    date: "2026-03-28",
    time: "10:00",
    name: "Brunch: Eggs Benedict",
    calories: 680,
    protein: 28,
    carbs: 42,
    fat: 44,
    fiber: 2,
    sugar: 4,
  },
  {
    id: uuid(),
    date: "2026-03-28",
    time: "14:30",
    name: "Caesar salad",
    calories: 420,
    protein: 18,
    carbs: 22,
    fat: 32,
    fiber: 4,
    sugar: 4,
  },
  {
    id: uuid(),
    date: "2026-03-28",
    time: "20:00",
    name: "Sushi platter",
    calories: 620,
    protein: 26,
    carbs: 82,
    fat: 18,
    fiber: 4,
    sugar: 12,
  },

  // Sunday March 29
  {
    id: uuid(),
    date: "2026-03-29",
    time: "09:30",
    name: "French toast with berries",
    calories: 450,
    protein: 14,
    carbs: 58,
    fat: 18,
    fiber: 4,
    sugar: 28,
  },
  {
    id: uuid(),
    date: "2026-03-29",
    time: "13:00",
    name: "Grilled cheese with tomato soup",
    calories: 520,
    protein: 18,
    carbs: 52,
    fat: 28,
    fiber: 6,
    sugar: 14,
  },
  {
    id: uuid(),
    date: "2026-03-29",
    time: "18:30",
    name: "Vegetable stir-fry with noodles",
    calories: 480,
    protein: 16,
    carbs: 62,
    fat: 18,
    fiber: 8,
    sugar: 10,
  },

  // Monday March 30 (Today)
  {
    id: uuid(),
    date: "2026-03-30",
    time: "08:00",
    name: "Greek yogurt parfait",
    calories: 320,
    protein: 18,
    carbs: 42,
    fat: 8,
    fiber: 4,
    sugar: 24,
  },
  {
    id: uuid(),
    date: "2026-03-30",
    time: "12:15",
    name: "Mediterranean bowl",
    calories: 580,
    protein: 24,
    carbs: 58,
    fat: 28,
    fiber: 10,
    sugar: 8,
  },
  {
    id: uuid(),
    date: "2026-03-30",
    time: "15:30",
    name: "Handful of almonds",
    calories: 180,
    protein: 6,
    carbs: 6,
    fat: 16,
    fiber: 4,
    sugar: 1,
  },
];

/**
 * Calculate macro totals from entries
 */
function calculateTotals(entries: CalorieEntry[]): MacroTotals {
  return entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
      fiber: (acc.fiber || 0) + (entry.fiber || 0),
      sugar: (acc.sugar || 0) + (entry.sugar || 0),
      sodium: (acc.sodium || 0) + (entry.sodium || 0),
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  );
}

/**
 * Get daily summary for a specific date
 */
export function getMockDailySummary(
  date: string,
  calorieGoal: number,
): DailySummary {
  const entries = mockEntries.filter((e) => e.date === date);
  const totals = calculateTotals(entries);

  return {
    date,
    entries,
    totals,
    calorieGoal,
    caloriesRemaining: Math.max(0, calorieGoal - totals.calories),
  };
}

/**
 * Get weekly summary for a specific ISO week
 */
export function getMockWeeklySummary(
  weekId: string,
  dailyCalorieGoal: number,
): WeeklySummary {
  const { start, end } = getWeekRange(weekId);
  const startDate = formatDateToISO(start);
  const endDate = formatDateToISO(end);

  // Get all 7 days
  const days: DailySummary[] = [];
  let currentDate = new Date(start);

  for (let i = 0; i < 7; i++) {
    const dateStr = formatDateToISO(currentDate);
    days.push(getMockDailySummary(dateStr, dailyCalorieGoal));
    currentDate = addDays(currentDate, 1);
  }

  // Calculate weekly totals
  const weeklyTotals = days.reduce(
    (acc, day) => ({
      calories: acc.calories + day.totals.calories,
      protein: acc.protein + day.totals.protein,
      carbs: acc.carbs + day.totals.carbs,
      fat: acc.fat + day.totals.fat,
      fiber: (acc.fiber || 0) + (day.totals.fiber || 0),
      sugar: (acc.sugar || 0) + (day.totals.sugar || 0),
      sodium: (acc.sodium || 0) + (day.totals.sodium || 0),
    }),
    {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    },
  );

  const weeklyCalorieGoal = dailyCalorieGoal * 7;
  const daysWithEntries = days.filter((d) => d.entries.length > 0);
  const averageDailyCalories =
    daysWithEntries.length > 0
      ? Math.round(weeklyTotals.calories / daysWithEntries.length)
      : 0;

  return {
    weekId,
    startDate,
    endDate,
    days,
    weeklyTotals,
    weeklyCalorieGoal,
    weeklyCaloriesRemaining: Math.max(
      0,
      weeklyCalorieGoal - weeklyTotals.calories,
    ),
    averageDailyCalories,
  };
}

/**
 * Get today's summary
 */
export function getMockTodaySummary(): DailySummary {
  return getMockDailySummary("2026-03-30"); // Fixed for demo purposes
}

/**
 * Get current week's summary
 */
export function getMockCurrentWeekSummary(): WeeklySummary {
  return getMockWeeklySummary("2026-W14"); // Week starting March 30
}

/**
 * Get last week's summary (for home page)
 */
export function getMockLastWeekSummary(): WeeklySummary {
  return getMockWeeklySummary("2026-W13"); // Week of March 23-29
}
