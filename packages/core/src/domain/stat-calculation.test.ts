import { describe, expect, it } from "vitest";
import type { ActivityEntry, MealEntry, Profile } from "../entities";
import { calculateStat } from "./stat-calculation";

// Week 2025-W02: Mon 2025-01-06 → Sun 2025-01-12
// (2025-W01 starts Dec 30 2024; W02 is the first full week starting Jan 6)
// Profile: Male, 80kg, 175cm, DOB 1990-01-01 (age 36 as of 2026), Moderately Active, Maintain
// BMR  = round(10*80 + 6.25*175 - 5*36 + 5)  = 1719
// TDEE = round(1719 * 1.55)                  = 2664
// dailyCalorieBudget                         = 2664

const WEEK_ID = "2025-W02";
const DAILY_BUDGET = 2664;

const baseProfile: Profile = {
  id: "user-1",
  name: "Test User",
  dateOfBirth: "1990-01-01",
  biologicalSex: "Male",
  height: 175,
  weight: 80,
  activityLevel: "Moderately Active",
  goal: "Maintain Healthy Lifestyle",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

const makeMeal = (
  date: string,
  overrides: Partial<MealEntry> = {},
): MealEntry => ({
  id: `meal-${date}`,
  date,
  name: "Test Meal",
  calories: 500,
  protein: 30,
  carbs: 50,
  fats: 20,
  fiber: 5,
  sugar: 10,
  sodium: 400,
  note: null,
  foodItems: null,
  createdAt: `${date}T12:00:00Z`,
  updatedAt: `${date}T12:00:00Z`,
  ...overrides,
});

const makeActivity = (date: string, caloriesBurned: number): ActivityEntry => ({
  id: `activity-${date}`,
  date,
  name: "Running",
  caloriesBurned,
  note: null,
  createdAt: `${date}T08:00:00Z`,
  updatedAt: `${date}T08:00:00Z`,
});

describe("calculateStat", () => {
  it("should calculate bmr, tdee, daily & weekly budget properly", () => {
    const result = calculateStat({
      weekId: WEEK_ID,
      today: "2025-01-08",
      profile: baseProfile,
      mealEntries: [],
      activityEntries: [],
    });

    expect(result.bmr).toBe(1719);
    expect(result.tdee).toBe(2664);
    expect(result.dailyCalorieBudget).toBe(DAILY_BUDGET);
    expect(result.weeklyStat.calorieBudget).toBe(DAILY_BUDGET * 7);
  });

  it("should ignore entries outside the week", () => {
    const mealEntries = [
      makeMeal("2025-01-05", { calories: 2500 }), // Outside week
      makeMeal("2025-01-06", { calories: 2000 }),
      makeMeal("2025-01-12", { calories: 3000 }),
      makeMeal("2025-01-13", { calories: 3500 }), // Outside week
    ];

    const activityEntries = [
      makeActivity("2025-01-05", 500), // Outside week
      makeActivity("2025-01-06", 300),
      makeActivity("2025-01-12", 400),
      makeActivity("2025-01-13", 600), // Outside week
    ];

    const result = calculateStat({
      weekId: WEEK_ID,
      today: "2025-01-08",
      profile: baseProfile,
      mealEntries,
      activityEntries,
    });

    expect(result.dailyStats.length).toBe(2);
  });

  describe("should only include days that has any type of entry in dailyStats", () => {
    const mealEntries = [
      makeMeal("2025-01-06", { calories: 2500 }),
      makeMeal("2025-01-07", { calories: 2000 }),
      makeMeal("2025-01-08", { calories: 3000 }),
    ];

    const activityEntries = [
      makeActivity("2025-01-06", 500),
      makeActivity("2025-01-07", 300),
    ];

    const calculateStatFor = (today: string) =>
      calculateStat({
        weekId: WEEK_ID,
        today,
        profile: baseProfile,
        mealEntries,
        activityEntries,
      });

    it("calculates when today has entries", () => {
      const result = calculateStatFor("2025-01-08");
      expect(result.dailyStats.length).toBe(3);
    });

    it("calculates when today does not have entries", () => {
      const result = calculateStatFor("2025-01-09");
      expect(result.dailyStats.length).toBe(3);
    });

    it("calculates when today does not have entries & in future date", () => {
      const result = calculateStatFor("2025-01-11");
      expect(result.dailyStats.length).toBe(3);
    });
  });

  describe("calculation", () => {
    const mealEntries = [
      makeMeal("2025-01-06", { calories: 1000 }),
      makeMeal("2025-01-07", { calories: 1000 }),
      makeMeal("2025-01-07", { calories: 2000 }),
      makeMeal("2025-01-08", { calories: 3000 }),
    ];

    const activityEntries = [
      makeActivity("2025-01-06", 500),
      makeActivity("2025-01-07", 500),
      makeActivity("2025-01-08", 400),
    ];

    const calculate = (today = "2025-01-08") =>
      calculateStat({
        weekId: WEEK_ID,
        today,
        profile: baseProfile,
        mealEntries,
        activityEntries,
      });

    it("week without zero meal entry day", () => {
      const result = calculate();

      const dailyStat1 = result.dailyStats.find((d) => d.date === "2025-01-06");
      const dailyStat2 = result.dailyStats.find((d) => d.date === "2025-01-07");
      const dailyStat3 = result.dailyStats.find((d) => d.date === "2025-01-08");

      expect(dailyStat1).toEqual(
        expect.objectContaining({
          date: "2025-01-06",
          caloriesConsumed: 1000,
          caloriesBurned: 500,
        }),
      );

      expect(dailyStat2).toEqual(
        expect.objectContaining({
          date: "2025-01-07",
          caloriesConsumed: 3000,
          caloriesBurned: 500,
        }),
      );

      expect(dailyStat3).toEqual(
        expect.objectContaining({
          date: "2025-01-08",
          caloriesConsumed: 3000,
          caloriesBurned: 400,
        }),
      );

      expect(result.weeklyStat).toEqual(
        expect.objectContaining({
          caloriesConsumed: 1000 + 3000 + 3000,
          caloriesBurned: 500 + 500 + 400,
        }),
      );
    });

    it("week with zero meal entry day", () => {
      const result = calculate("2025-01-10");
      const dayEntry = result.weeklyStat.days.find(
        (d) => d.date === "2025-01-09",
      );
      expect(dayEntry).toBeDefined();
      expect(dayEntry).toEqual(
        expect.objectContaining({
          date: "2025-01-09",
          caloriesConsumed: DAILY_BUDGET,
          caloriesBurned: 0,
          estimated: true,
        }),
      );
    });
  });
});
