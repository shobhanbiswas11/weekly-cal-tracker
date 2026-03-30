// Data hooks for calorie tracking
// These currently use mock data but have the same interface as future API hooks
// When ready to connect to backend, replace implementations with TanStack Query

import { useMemo } from "react";
import type { DailySummary, WeeklySummary } from "../types";
import { getCurrentWeek, getToday } from "../utils";
import {
  getMockCurrentWeekSummary,
  getMockDailySummary,
  getMockTodaySummary,
  getMockWeeklySummary,
} from "./mock-data";

interface UseDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Get entries and summary for a specific date
 */
export function useEntries(date?: string): UseDataResult<DailySummary> {
  const targetDate = date || getToday();

  // In a real app, this would be useQuery from TanStack Query
  const data = useMemo(() => {
    // Simulate the data
    return getMockDailySummary(targetDate);
  }, [targetDate]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Get today's summary (convenience hook)
 */
export function useTodaySummary(): UseDataResult<DailySummary> {
  const data = useMemo(() => getMockTodaySummary(), []);

  return {
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Get weekly summary for a specific ISO week
 */
export function useWeeklySummary(
  weekId?: string,
): UseDataResult<WeeklySummary> {
  const targetWeek = weekId || getCurrentWeek();

  const data = useMemo(() => {
    return getMockWeeklySummary(targetWeek);
  }, [targetWeek]);

  return {
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Get current week's summary (convenience hook)
 */
export function useCurrentWeekSummary(): UseDataResult<WeeklySummary> {
  const data = useMemo(() => getMockCurrentWeekSummary(), []);

  return {
    data,
    isLoading: false,
    error: null,
  };
}

/**
 * Get the previous week's summary (useful for "this week so far" when week just started)
 */
export function useLastWeekSummary(): UseDataResult<WeeklySummary> {
  const data = useMemo(() => getMockWeeklySummary("2026-W13"), []);

  return {
    data,
    isLoading: false,
    error: null,
  };
}
