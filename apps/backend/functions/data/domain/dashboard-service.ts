// Dashboard service - fetches profile and entries, no domain logic

import {
  addDays,
  format,
  getISOWeek,
  getISOWeekYear,
  setISOWeek,
  startOfISOWeek,
} from "date-fns";
import type { DataRecord } from "../../shared/types";
import * as entryRepo from "./entry-repository";
import * as profileRepo from "./profile-repository";

// Get week boundaries for querying entries
const getWeekBoundaries = (weekId: string): { start: string; end: string } => {
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

const getCurrentWeekId = (): string => {
  const today = new Date();
  const year = getISOWeekYear(today);
  const week = getISOWeek(today);
  return `${year}-W${week.toString().padStart(2, "0")}`;
};

export const getDashboard = async (userId: string): Promise<DataRecord> => {
  const weekId = getCurrentWeekId();
  const { start, end } = getWeekBoundaries(weekId);

  const [profile, entries] = await Promise.all([
    profileRepo.getProfile(userId),
    entryRepo.getEntriesByDateRange(userId, start, end),
  ]);

  return { profile, weekId, entries };
};

export const getWeeklySummary = async (
  userId: string,
  weekId: string,
): Promise<DataRecord> => {
  const { start, end } = getWeekBoundaries(weekId);
  const entries = await entryRepo.getEntriesByDateRange(userId, start, end);
  return { weekId, entries };
};
