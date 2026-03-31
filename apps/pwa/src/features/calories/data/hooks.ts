// Data hooks for calorie tracking using TanStack Query
// Fetches from /dashboard and /weeks/{weekId} endpoints
//
// These hooks are feature-level abstractions, not page-specific.
// Pages compose these hooks to build their views.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEntry as apiCreateEntry,
  deleteEntry as apiDeleteEntry,
  updateEntry as apiUpdateEntry,
  fetchDashboard,
  fetchWeeklySummary,
} from "../../../lib/api";
import { calorieKeys, dashboardKeys } from "../../shared/query-keys";
import {
  calculateTotals,
  DEFAULT_CALORIE_GOAL,
  getPreviousWeek,
  getWeekIdForDate,
  toCalorieEntry,
  transformToWeeklySummary,
} from "../services";
import type { CalorieEntry, DailySummary } from "../types";
import { getCurrentWeek, getToday } from "../utils";

// Re-export query keys for backwards compatibility
export { calorieKeys } from "../../shared/query-keys";

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Get dashboard data directly from the API
 * Returns profile and current week's entries
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Dashboard summary hook
 * Returns processed calorie data with profile existence check.
 * Combines profile + current week entries into a unified view.
 */
export function useDashboardSummary() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (isLoading || !dashboard) {
    return { isLoading: true, hasProfile: false } as const;
  }

  // Check if profile exists
  if (!dashboard.profile) {
    return { isLoading: false, hasProfile: false } as const;
  }

  const today = getToday();
  const calorieGoal = dashboard.profile.calorieGoal ?? DEFAULT_CALORIE_GOAL;

  // Convert entries to CalorieEntry format
  const allEntries: CalorieEntry[] = dashboard.entries.map(toCalorieEntry);
  const todayEntries = allEntries.filter((e) => e.date === today);

  // Calculate totals
  const todayTotals = calculateTotals(todayEntries);
  const weekTotals = calculateTotals(allEntries);
  const weekGoal = calorieGoal * 7;

  return {
    isLoading: false,
    hasProfile: true,
    weekId: dashboard.weekId,
    calorieGoal,
    weekGoal,
    todayEntries,
    todayTotals,
    weekTotals,
    error,
  } as const;
}

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
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 5,
  });

  const today = getToday();
  const calorieGoal =
    (dashboard.data?.profile?.calorieGoal as number) || DEFAULT_CALORIE_GOAL;

  // Transform API response to WeeklySummary, then extract today
  const weekSummary = dashboard.data
    ? transformToWeeklySummary(
        dashboard.data.weekId,
        dashboard.data.entries,
        calorieGoal,
      )
    : undefined;

  const dayData = weekSummary?.days.find((d) => d.date === today);

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
    queryFn: fetchDashboard,
    staleTime: 1000 * 60 * 5,
    enabled: isCurrentWeek,
  });

  // Week query (for historical weeks)
  const weekQuery = useQuery({
    queryKey: calorieKeys.weeks(targetWeek),
    queryFn: () => fetchWeeklySummary(targetWeek),
    staleTime: 1000 * 60 * 30, // 30 minutes for historical data
    enabled: !isCurrentWeek,
  });

  if (isCurrentWeek) {
    const calorieGoal =
      (dashboardQuery.data?.profile?.calorieGoal as number) ||
      DEFAULT_CALORIE_GOAL;
    const weekSummary = dashboardQuery.data
      ? transformToWeeklySummary(
          dashboardQuery.data.weekId,
          dashboardQuery.data.entries,
          calorieGoal,
        )
      : undefined;

    return {
      data: weekSummary,
      isLoading: dashboardQuery.isLoading,
      error: dashboardQuery.error,
      refetch: dashboardQuery.refetch,
    };
  }

  // Transform historical week data
  const weekSummary = weekQuery.data
    ? transformToWeeklySummary(
        weekQuery.data.weekId,
        weekQuery.data.entries,
        DEFAULT_CALORIE_GOAL,
      )
    : undefined;

  return {
    data: weekSummary,
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

// Re-export services for convenience
export {
  calculateTotals,
  DEFAULT_CALORIE_GOAL,
  getPreviousWeek,
  getWeekIdForDate,
  toCalorieEntry,
  transformToWeeklySummary,
} from "../services";
