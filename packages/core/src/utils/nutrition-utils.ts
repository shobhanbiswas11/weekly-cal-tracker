import { differenceInYears, parseISO } from "date-fns";

type BMRInput = {
  dateOfBirth: string;
  weight: number;
  height: number;
  biologicalSex: "Male" | "Female";
};

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  Sedentary: 1.2,
  "Lightly Active": 1.375,
  "Moderately Active": 1.55,
  "Very Active": 1.725,
  "Super Active": 1.9,
};

export const calculateAge = (dateOfBirth: string): number => {
  return differenceInYears(new Date(), parseISO(dateOfBirth));
};

export const calculateBMR = (profile: BMRInput): number => {
  const age = calculateAge(profile.dateOfBirth);
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * age;
  return Math.round(profile.biologicalSex === "Female" ? base - 161 : base + 5);
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.375));
};

export const calculateDailyCalorieBudget = (
  tdee: number,
  goal: string,
): number => {
  if (goal === "Lose Weight") return Math.max(1200, tdee - 500);
  if (goal === "Gain Weight") return tdee + 500;
  return tdee;
};

export const calculateNutrientTargets = (
  dailyCalorieBudget: number,
  biologicalSex: "Male" | "Female",
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
