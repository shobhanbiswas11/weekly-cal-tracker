// Date and calorie calculation utilities

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return formatDateToISO(new Date());
}

/**
 * Format a Date object to YYYY-MM-DD (local time)
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date object in local time
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get ISO week string (e.g., "2026-W13")
 */
export function getISOWeek(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
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

  // Find January 4th of the year (always in week 1)
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;

  // Find Monday of week 1
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - dayOfWeek + 1);

  // Calculate Monday of the target week
  const start = new Date(mondayWeek1);
  start.setDate(mondayWeek1.getDate() + (week - 1) * 7);

  // Calculate Sunday
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
}

/**
 * Format date for display (e.g., "Monday, Mar 30")
 */
export function formatDateDisplay(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format date short (e.g., "Mar 30")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format time for display (e.g., "8:30 AM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Get next/previous week ISO string
 */
export function getAdjacentWeek(
  isoWeek: string,
  direction: "next" | "prev",
): string {
  const { start } = getWeekRange(isoWeek);
  const newDate = addDays(start, direction === "next" ? 7 : -7);
  return getISOWeek(newDate);
}

/**
 * Check if a date is today
 */
export function isToday(date: string): boolean {
  return date === getToday();
}

/**
 * Get day of week name
 */
export function getDayName(date: Date | string, short = false): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    weekday: short ? "short" : "long",
  });
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
