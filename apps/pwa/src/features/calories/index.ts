// Barrel export for calories feature
//
// Components: UI elements for calorie display (CalorieKPI, MacroGrid, etc.)
// Services: Pure business logic functions (transformToWeeklySummary, etc.)
// Hooks: React Query wrappers (useDashboardSummary, useWeeklySummary, etc.)
// Types: Domain types from @weekly-cal/core (CalorieEntry, DailySummary, etc.)
// Utils: Date/time utilities (getToday, getCurrentWeek, etc.)
// Schemas: Zod schemas for tool parameters

export * from "./components";
export * from "./data";
export * from "./schemas";
export * from "./services";
export * from "./utils";

// Re-export types from core package for backwards compatibility
export type {
  CalorieEntry,
  DailySummary,
  MacroTotals,
  MacroType,
  UserGoals,
  WeeklySummary,
} from "@weekly-cal/core";
