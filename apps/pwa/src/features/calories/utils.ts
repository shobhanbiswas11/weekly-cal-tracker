// Date and calorie calculation utilities
import {
  addWeeks,
  addDays as dateFnsAddDays,
  getISOWeek as dateFnsGetISOWeek,
  isToday as dateFnsIsToday,
  endOfISOWeek,
  format,
  getISOWeekYear,
  parse,
  startOfISOWeek,
} from "date-fns";

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Format a Date object to YYYY-MM-DD (local time)
 */
export function formatDateToISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Parse a YYYY-MM-DD string to a Date object in local time
 */
export function parseLocalDate(dateStr: string): Date {
  return parse(dateStr, "yyyy-MM-dd", new Date());
}

/**
 * Get ISO week string (e.g., "2026-W13")
 */
export function getISOWeek(date: Date): string {
  const weekYear = getISOWeekYear(date);
  const weekNum = dateFnsGetISOWeek(date);
  return `${weekYear}-W${weekNum.toString().padStart(2, "0")}`;
}

/**
 * Get current week's ISO string
 */
export function getCurrentWeek(): string {
  return getISOWeek(new Date());
}

/**
 * Get start (Monday) and end (Sunday) dates for an ISO week
 */
export function getWeekRange(isoWeek: string): { start: Date; end: Date } {
  const [year, week] = isoWeek.split("-W").map(Number);
  // Create a date in the target week and find its ISO week boundaries
  const jan4 = new Date(year, 0, 4); // Jan 4 is always in week 1
  const targetDate = addWeeks(startOfISOWeek(jan4), week - 1);
  return {
    start: startOfISOWeek(targetDate),
    end: endOfISOWeek(targetDate),
  };
}

/**
 * Format date for display (e.g., "Monday, Mar 30")
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  return format(d, "EEEE, MMM d");
}

/**
 * Format date short (e.g., "Mar 30")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  return format(d, "MMM d");
}

/**
 * Format time for display (e.g., "8:30 AM")
 */
export function formatTime(time: string): string {
  const date = parse(time, "HH:mm", new Date());
  return format(date, "h:mm a");
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  return dateFnsAddDays(d, days);
}

/**
 * Get next/previous week ISO string
 */
export function getAdjacentWeek(
  isoWeek: string,
  direction: "next" | "prev",
): string {
  const { start } = getWeekRange(isoWeek);
  const newDate = addWeeks(start, direction === "next" ? 1 : -1);
  return getISOWeek(newDate);
}

/**
 * Check if a date is today
 */
export function isToday(date: string): boolean {
  return dateFnsIsToday(parseLocalDate(date));
}

/**
 * Get day of week name
 */
export function getDayName(date: Date | string, short = false): string {
  const d = typeof date === "string" ? parseLocalDate(date) : date;
  return format(d, short ? "EEE" : "EEEE");
}

/**
 * Calculate percentage (capped at 100 for progress displays)
 */
export function calculatePercentage(
  value: number,
  total: number,
  cap = true,
): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return cap ? Math.min(percentage, 100) : percentage;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}
