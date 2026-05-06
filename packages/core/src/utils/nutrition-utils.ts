import { differenceInYears, parseISO } from "date-fns";
import type { ActivityLevel, BiologicalSex, Goal } from "../constants";
import { mapActivityMultipliers } from "../constants";

type BMRInput = {
  dateOfBirth: string;
  weight: number;
  height: number;
  biologicalSex: BiologicalSex;
};

export const calculateAge = (dateOfBirth: string): number => {
  return differenceInYears(new Date(), parseISO(dateOfBirth));
};

export const calculateBMR = (profile: BMRInput): number => {
  const age = calculateAge(profile.dateOfBirth);
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * age;
  return Math.round(profile.biologicalSex === "Female" ? base - 161 : base + 5);
};

export const calculateTDEE = (
  bmr: number,
  activityLevel: ActivityLevel,
): number => {
  return Math.round(bmr * (mapActivityMultipliers[activityLevel] ?? 1.375));
};

export const calculateDailyCalorieBudget = (
  tdee: number,
  goal: Goal,
): number => {
  if (goal === "Lose Weight") return Math.max(1200, tdee - 500);
  if (goal === "Gain Weight") return tdee + 500;
  return tdee;
};

export const calculateNutrientTargets = (
  dailyCalorieBudget: number,
  biologicalSex: BiologicalSex,
): {
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
} => ({
  protein: Math.round((dailyCalorieBudget * 0.3) / 4),
  carbs: Math.round((dailyCalorieBudget * 0.4) / 4),
  fats: Math.round((dailyCalorieBudget * 0.3) / 9),
  fiber: biologicalSex === "Female" ? 25 : 38,
  sodium: 2300,
});

type CaloriePlanInput = BMRInput & {
  activityLevel: ActivityLevel;
  goal: Goal;
};

export const calculateCaloriePlan = (profile: CaloriePlanInput) => {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const dailyCalorieBudget = calculateDailyCalorieBudget(tdee, profile.goal);
  const nutrientTargets = calculateNutrientTargets(
    dailyCalorieBudget,
    profile.biologicalSex,
  );
  return { bmr, tdee, dailyCalorieBudget, nutrientTargets };
};
