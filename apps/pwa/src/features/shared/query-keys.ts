// Centralized query keys for TanStack Query
// Prevents cross-feature imports by providing a shared registry

/**
 * Query keys for dashboard data (profile + current week entries)
 * Used by both profile and calories features
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
};

/**
 * Query keys for weekly calorie data
 * Used by calories feature for historical week queries
 */
export const calorieKeys = {
  weeks: (weekId: string) => ["weeks", weekId] as const,
};
