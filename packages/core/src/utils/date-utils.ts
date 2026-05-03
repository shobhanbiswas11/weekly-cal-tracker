import {
  addDays,
  format,
  parseISO,
  setISOWeek,
  startOfISOWeek,
} from "date-fns";

export const getWeekBoundaries = (
  weekId: string,
): { start: string; end: string } => {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error(`Invalid week format: ${weekId}. Expected YYYY-Www`);
  }
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  const dateInWeek = setISOWeek(new Date(year, 0, 4), week);
  const weekStart = startOfISOWeek(dateInWeek);
  return {
    start: format(weekStart, "yyyy-MM-dd"),
    end: format(addDays(weekStart, 6), "yyyy-MM-dd"),
  };
};

export const isValidDateFormat = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

export const isValidWeekFormat = (week: string): boolean => {
  return /^\d{4}-W\d{2}$/.test(week);
};

export const getTodayISO = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

export const getWeekDates = (weekId: string): string[] => {
  const match = weekId.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return [];
  const year = parseInt(match[1]);
  const week = parseInt(match[2]);
  const dateInWeek = setISOWeek(new Date(year, 0, 4), week);
  const monday = startOfISOWeek(dateInWeek);
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(monday, i), "yyyy-MM-dd"),
  );
};

export const formatTime = (iso: string | undefined | null): string => {
  if (!iso) return "";
  return format(parseISO(iso), "HH:mm");
};
