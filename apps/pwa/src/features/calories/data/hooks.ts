// Data hooks for calorie tracking using TanStack Query
// Fetches from /dashboard and /weeks/{weekId} endpoints

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEntry as apiCreateEntry,
  deleteEntry as apiDeleteEntry,
  updateEntry as apiUpdateEntry,
  fetchDashboard,
  fetchWeeklySummary,
} from "../../../lib/api";
import { dashboardKeys } from "../../profile/data/hooks";
import type { DailySummary, WeeklySummary } from "../types";
import { getCurrentWeek, getToday } from "../utils";

// Response types (API returns generic records, we cast locally)
interface DashboardResponse {
  profile: Record<string, unknown> | null;
  currentWeek: WeeklySummary;
}

// Query keys
export const calorieKeys = {
  weeks: (weekId: string) => ["weeks", weekId] as const,
};

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get entries and summary for a specific date
 * Extracts from the appropriate week's data
 */
export function useEntries(date?: string) {
  const targetDate = date || getToday();
  // Calculate which week this date belongs to
  const weekId = getWeekIdForDate(targetDate);

  const weekQuery = useWeeklySummary(weekId);

  // Extract the specific day from the week data
  const dayData = weekQuery.data?.days.find(
    (d: DailySummary) => d.date === targetDate,
  );

  return {
    data: dayData,
    isLoading: weekQuery.isLoading,
    error: weekQuery.error,
    refetch: weekQuery.refetch,
  };
}

/**
 * Get today's summary (convenience hook)
 * Uses dashboard data which includes current week
 */
export function useTodaySummary() {
  const dashboard = useQuery({
    queryKey: dashboardKeys.all,
    queryFn: async () =>
      (await fetchDashboard()) as unknown as DashboardResponse,
    staleTime: 1000 * 60 * 5,
  });

  const today = getToday();
  const dayData = dashboard.data?.currentWeek.days.find(
    (d: DailySummary) => d.date === today,
  );

  return {
    data: dayData,
    isLoading: dashboard.isLoading,
    error: dashboard.error,
  };
}

/**
 * Get weekly summary for a specific ISO week
 */
export function useWeeklySummary(weekId?: string) {
  const targetWeek = weekId || getCurrentWeek();
  const currentWeek = getCurrentWeek();

  // Use dashboard data for current week, fetch for other weeks
  const isCurrentWeek = targetWeek === currentWeek;

  // Dashboard query (for current week)
  const dashboardQuery = useQuery({
    queryKey: dashboardKeys.all,
    queryFn: async () =>
      (await fetchDashboard()) as unknown as DashboardResponse,
    staleTime: 1000 * 60 * 5,
    enabled: isCurrentWeek,
  });

  // Week query (for historical weeks)
  const weekQuery = useQuery({
    queryKey: calorieKeys.weeks(targetWeek),
    queryFn: async () =>
      (await fetchWeeklySummary(targetWeek)) as unknown as WeeklySummary,
    staleTime: 1000 * 60 * 30, // 30 minutes for historical data
    enabled: !isCurrentWeek,
  });

  if (isCurrentWeek) {
    return {
      data: dashboardQuery.data?.currentWeek,
      isLoading: dashboardQuery.isLoading,
      error: dashboardQuery.error,
      refetch: dashboardQuery.refetch,
    };
  }

  return {
    data: weekQuery.data,
    isLoading: weekQuery.isLoading,
    error: weekQuery.error,
    refetch: weekQuery.refetch,
  };
}

/**
 * Get current week's summary (convenience hook)
 */
export function useCurrentWeekSummary() {
  return useWeeklySummary(getCurrentWeek());
}

/**
 * Get the previous week's summary
 */
export function useLastWeekSummary() {
  const lastWeek = getPreviousWeek(getCurrentWeek());
  return useWeeklySummary(lastWeek);
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new food entry
 */
export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiCreateEntry(data),
    onSuccess: (entry) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      const date = entry.date as string;
      if (date) {
        const weekId = getWeekIdForDate(date);
        queryClient.invalidateQueries({ queryKey: calorieKeys.weeks(weekId) });
      }
    },
  });
}

/**
 * Update an existing food entry
 */
export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      date,
      id,
      data,
    }: {
      date: string;
      id: string;
      data: Record<string, unknown>;
    }) => apiUpdateEntry(date, id, data),
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      const date = entry.date as string;
      if (date) {
        const weekId = getWeekIdForDate(date);
        queryClient.invalidateQueries({ queryKey: calorieKeys.weeks(weekId) });
      }
    },
  });
}

/**
 * Delete a food entry
 */
export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, id }: { date: string; id: string }) =>
      apiDeleteEntry(date, id),
    onSuccess: (_result, { date }) => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      const weekId = getWeekIdForDate(date);
      queryClient.invalidateQueries({ queryKey: calorieKeys.weeks(weekId) });
    },
  });
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get ISO week ID for a date
 */
function getWeekIdForDate(dateStr: string): string {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1
  const week1 = new Date(date.getFullYear(), 0, 4);
  // Calculate full weeks to Thursday
  const weekNum =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${date.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
}

/**
 * Get the previous week's ID
 */
function getPreviousWeek(weekId: string): string {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return weekId;

  let year = parseInt(match[1]);
  let week = parseInt(match[2]) - 1;

  if (week < 1) {
    year--;
    // Get last week of previous year (simplified - assumes 52 weeks)
    week = 52;
  }

  return `${year}-W${week.toString().padStart(2, "0")}`;
}
