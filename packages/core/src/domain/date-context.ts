import { endOfWeek, format, startOfWeek } from "date-fns";

export function dateContext() {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const dayOfWeek = format(now, "EEEE");
  const month = format(now, "MMMM yyyy");
  const week = format(now, "RRRR-'W'II");
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

  return `## Current Date Context
- Today: ${dayOfWeek}, ${today}
- Month: ${month}
- Week: ${week} (Monday ${weekStart} to Sunday ${weekEnd})
`;
}
