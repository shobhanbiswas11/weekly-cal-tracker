import { describe, expect, it } from "vitest";
import type { MealEntry, Profile } from "../entities";
import {
  calculateBMR,
  calculateDailyCalorieBudget,
  calculateTDEE,
} from "../utils/nutrition-utils";
import type { ActivityEntry } from "./weekly-nutrition";
import { calculateWeeklyNutrition } from "./weekly-nutrition";

// All scenarios use 2026-W18: Mon Apr 27 – Sun May 3
const baseProfile: Profile = {
  id: "user-1",
  name: "Test User",
  dateOfBirth: "1990-05-03",
  biologicalSex: "Male",
  height: 175,
  weight: 80,
  activityLevel: "Sedentary",
  goal: "Maintain Healthy Lifestyle",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeMeal(id: string, date: string, calories: number): MealEntry {
  return {
    id,
    date,
    name: "Test Meal",
    calories,
    protein: 30,
    carbs: 50,
    fats: 20,
    fiber: 5,
    sugar: 10,
    sodium: 500,
    note: null,
    foodItems: null,
    createdAt: `${date}T12:00:00.000Z`,
    updatedAt: `${date}T12:00:00.000Z`,
  };
}

function makeActivity(
  id: string,
  date: string,
  caloriesBurned: number,
): ActivityEntry {
  return { id, date, name: "Run", caloriesBurned };
}

describe("calculateWeeklyNutrition", () => {
  it("derives BMR, TDEE, and daily budget correctly from profile", () => {
    const result = calculateWeeklyNutrition(
      [makeMeal("m1", "2026-04-28", 2000)],
      [],
      baseProfile,
      "2026-04-28",
    );

    const expectedBmr = calculateBMR(baseProfile);
    const expectedTdee = calculateTDEE(expectedBmr, baseProfile.activityLevel);
    const expectedBudget = calculateDailyCalorieBudget(
      expectedTdee,
      baseProfile.goal,
    );

    expect(result.bmr).toBe(expectedBmr);
    expect(result.tdee).toBe(expectedTdee);
    expect(result.dailyCalorieBudget).toBe(expectedBudget);
  });

  it("fills past days without meals with TDEE as estimated", () => {
    // today = Thursday Apr 30; meals only on Mon Apr 27 and Tue Apr 28
    // Wed Apr 29 and Thu Apr 30 have no meals → estimated with TDEE
    const meals = [
      makeMeal("m1", "2026-04-27", 1800),
      makeMeal("m2", "2026-04-28", 2000),
    ];
    const result = calculateWeeklyNutrition(
      meals,
      [],
      baseProfile,
      "2026-04-30",
    );

    expect(result.days).toHaveLength(4);
    expect(result.days[0]).toMatchObject({
      date: "2026-04-27",
      isEstimated: false,
      caloriesConsumed: 1800,
    });
    expect(result.days[1]).toMatchObject({
      date: "2026-04-28",
      isEstimated: false,
      caloriesConsumed: 2000,
    });
    expect(result.days[2]).toMatchObject({
      date: "2026-04-29",
      isEstimated: true,
      caloriesConsumed: result.tdee,
    });
    expect(result.days[3]).toMatchObject({
      date: "2026-04-30",
      isEstimated: true,
      caloriesConsumed: result.tdee,
    });
  });

  it("excludes future dates (after today)", () => {
    // today = Tuesday Apr 28; meal also logged on Thursday Apr 30 (future)
    const meals = [
      makeMeal("m1", "2026-04-27", 1800),
      makeMeal("m2", "2026-04-28", 2000),
      makeMeal("m3", "2026-04-30", 1600), // future, should be ignored
    ];
    const result = calculateWeeklyNutrition(
      meals,
      [],
      baseProfile,
      "2026-04-28",
    );

    expect(result.days).toHaveLength(2);
    expect(result.days.map((d) => d.date)).toEqual([
      "2026-04-27",
      "2026-04-28",
    ]);
  });

  it("subtracts activity calories from an actual meal day", () => {
    const meals = [makeMeal("m1", "2026-04-28", 2000)];
    const activities = [makeActivity("a1", "2026-04-28", 300)];
    const result = calculateWeeklyNutrition(
      meals,
      activities,
      baseProfile,
      "2026-04-28",
    );

    const tuesday = result.days.find((d) => d.date === "2026-04-28")!;
    expect(tuesday.caloriesConsumed).toBe(2000);
    expect(tuesday.caloriesBurned).toBe(300);
    expect(tuesday.netCalories).toBe(1700);
    expect(result.totalCaloriesBurned).toBe(300);
    expect(result.netCalories).toBe(result.totalCaloriesConsumed - 300);
  });

  it("applies activity calories to estimated (TDEE) days", () => {
    // today = Wed Apr 29; meal on Tue, activity on Wed (no meal → estimated)
    const meals = [makeMeal("m1", "2026-04-28", 2000)];
    const activities = [makeActivity("a1", "2026-04-29", 400)];
    const result = calculateWeeklyNutrition(
      meals,
      activities,
      baseProfile,
      "2026-04-29",
    );

    const wednesday = result.days.find((d) => d.date === "2026-04-29")!;
    expect(wednesday.isEstimated).toBe(true);
    expect(wednesday.caloriesConsumed).toBe(result.tdee);
    expect(wednesday.caloriesBurned).toBe(400);
    expect(wednesday.netCalories).toBe(result.tdee - 400);
  });

  it("multiple meals on the same day are summed together", () => {
    const meals = [
      makeMeal("m1", "2026-04-28", 600),
      makeMeal("m2", "2026-04-28", 800),
      makeMeal("m3", "2026-04-28", 400),
    ];
    const result = calculateWeeklyNutrition(
      meals,
      [],
      baseProfile,
      "2026-04-28",
    );

    const tuesday = result.days.find((d) => d.date === "2026-04-28")!;
    expect(tuesday.caloriesConsumed).toBe(1800);
    expect(tuesday.isEstimated).toBe(false);
  });

  it("days are sorted ascending and limited to today", () => {
    // today = Tuesday Apr 28; Mon is estimated, Tue is actual, Wed is future
    const result = calculateWeeklyNutrition(
      [makeMeal("m1", "2026-04-28", 2000)],
      [],
      baseProfile,
      "2026-04-28",
    );

    expect(result.days).toHaveLength(2);
    expect(result.days[0]).toMatchObject({
      date: "2026-04-27",
      isEstimated: true,
    });
    expect(result.days[1]).toMatchObject({
      date: "2026-04-28",
      caloriesConsumed: 2000,
    });
  });

  it("weeklyBalance is positive when under budget", () => {
    // today = Monday; only one day, one meal under budget
    const budget = calculateDailyCalorieBudget(
      calculateTDEE(calculateBMR(baseProfile), baseProfile.activityLevel),
      baseProfile.goal,
    );
    const meals = [makeMeal("m1", "2026-04-27", budget - 200)];
    const result = calculateWeeklyNutrition(
      meals,
      [],
      baseProfile,
      "2026-04-27",
    );

    expect(result.days).toHaveLength(1);
    expect(result.weeklyBalance).toBe(200);
  });
});
