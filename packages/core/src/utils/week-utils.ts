import { addDays, format, setISOWeek, startOfISOWeek } from "date-fns";

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
