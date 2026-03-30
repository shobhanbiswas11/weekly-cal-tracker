// getWeeklySummary Lambda - Get weekly summary with daily breakdowns

import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { getEntriesByDateRange } from "../shared/dynamodb";
import {
  ApiResponse,
  CalorieEntry,
  DailySummary,
  WeeklySummary,
} from "../shared/types";

// Get the start of the week (Monday) for a given date
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  return new Date(d.setDate(diff));
};

// Format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Extract userId from JWT claims
const getUserId = (
  event: Parameters<APIGatewayProxyHandlerV2WithJWTAuthorizer>[0],
): string => {
  const claims = event.requestContext.authorizer.jwt.claims;
  return claims.sub as string;
};

// Create CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Content-Type": "application/json",
};

// Group entries by date
const groupEntriesByDate = (
  entries: CalorieEntry[],
): Map<string, CalorieEntry[]> => {
  const grouped = new Map<string, CalorieEntry[]>();
  for (const entry of entries) {
    const existing = grouped.get(entry.date) || [];
    existing.push(entry);
    grouped.set(entry.date, existing);
  }
  return grouped;
};

// Create daily summary for a date
const createDailySummary = (
  date: string,
  entries: CalorieEntry[],
): DailySummary => {
  return {
    date,
    entries,
    totalCalories: entries.reduce((sum, e) => sum + e.calories, 0),
    totalProtein: entries.reduce((sum, e) => sum + e.protein, 0),
    totalCarbs: entries.reduce((sum, e) => sum + e.carbs, 0),
    totalFat: entries.reduce((sum, e) => sum + e.fat, 0),
  };
};

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  // Handle preflight
  if (event.requestContext.http.method === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    const userId = getUserId(event);

    // Get week parameter (ISO week format: YYYY-Www) or default to current week
    const weekParam = event.queryStringParameters?.week;

    let weekStart: Date;

    if (weekParam) {
      // Parse ISO week format: 2026-W13
      const match = weekParam.match(/^(\d{4})-W(\d{2})$/);
      if (!match) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            success: false,
            error: "Invalid week format. Use YYYY-Www (e.g., 2026-W13)",
          } as ApiResponse<never>),
        };
      }

      const year = parseInt(match[1]);
      const week = parseInt(match[2]);

      // Calculate first day of the ISO week
      // Jan 4 is always in week 1
      const jan4 = new Date(year, 0, 4);
      const jan4DayOfWeek = jan4.getDay() || 7; // Convert Sunday (0) to 7
      const firstMonday = new Date(jan4);
      firstMonday.setDate(jan4.getDate() - jan4DayOfWeek + 1);

      weekStart = addDays(firstMonday, (week - 1) * 7);
    } else {
      // Default to current week
      weekStart = getWeekStart(new Date());
    }

    const weekEnd = addDays(weekStart, 6);
    const startDate = formatDate(weekStart);
    const endDate = formatDate(weekEnd);

    // Fetch all entries for the week
    const entries = await getEntriesByDateRange(userId, startDate, endDate);
    const groupedEntries = groupEntriesByDate(entries);

    // Create daily summaries for all 7 days
    const days: DailySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const date = formatDate(addDays(weekStart, i));
      const dayEntries = groupedEntries.get(date) || [];
      days.push(createDailySummary(date, dayEntries));
    }

    // Calculate weekly totals
    const weeklyTotalCalories = days.reduce(
      (sum, d) => sum + d.totalCalories,
      0,
    );
    const weeklyTotalProtein = days.reduce((sum, d) => sum + d.totalProtein, 0);
    const weeklyTotalCarbs = days.reduce((sum, d) => sum + d.totalCarbs, 0);
    const weeklyTotalFat = days.reduce((sum, d) => sum + d.totalFat, 0);

    // Calculate average (only for days with entries)
    const daysWithEntries = days.filter((d) => d.entries.length > 0).length;
    const averageDailyCalories =
      daysWithEntries > 0
        ? Math.round(weeklyTotalCalories / daysWithEntries)
        : 0;

    const summary: WeeklySummary = {
      startDate,
      endDate,
      days,
      weeklyTotalCalories,
      weeklyTotalProtein,
      weeklyTotalCarbs,
      weeklyTotalFat,
      averageDailyCalories,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        data: summary,
      } as ApiResponse<WeeklySummary>),
    };
  } catch (error) {
    console.error("Error fetching weekly summary:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: `Failed to fetch weekly summary: ${errorMessage}`,
      } as ApiResponse<never>),
    };
  }
};
