import { endOfWeek, format, startOfWeek } from "date-fns";
import type { MealEntry, Profile } from "../schemas";

export interface SystemPromptProps {
  userProfile?: Partial<Profile>;
  currentWeekEntries?: MealEntry[];
}

function sumMacros(entries: MealEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      cal: acc.cal + e.calories,
      p: acc.p + e.protein,
      c: acc.c + e.carbs,
      f: acc.f + e.fats,
      fib: acc.fib + (e.fiber ?? 0),
      sug: acc.sug + (e.sugar ?? 0),
      na: acc.na + (e.sodium ?? 0),
    }),
    { cal: 0, p: 0, c: 0, f: 0, fib: 0, sug: 0, na: 0 },
  );
}

function renderTodaysEntries(todaysEntries: MealEntry[]) {
  if (todaysEntries.length === 0) {
    return "No meals logged today.";
  }

  const list = todaysEntries
    .map(
      (e) =>
        `- [${e.id}] ${e.name} ${e.calories}kcal${e.note ? ` (${e.note})` : ""}`,
    )
    .join("\n");

  const t = sumMacros(todaysEntries);

  return `${list}
Total: ${t.cal}kcal | P:${t.p}g C:${t.c}g F:${t.f}g | Fib:${t.fib}g Sug:${t.sug}g Na:${t.na}mg`;
}

function renderWeeklySummary(entries: MealEntry[]) {
  if (entries.length === 0) {
    return "No meals logged this week.";
  }

  const t = sumMacros(entries);
  const days = new Set(entries.map((e) => e.date)).size;

  return `Days logged: ${days}/7 | Meals: ${entries.length}
Total: ${t.cal}kcal | P:${t.p}g C:${t.c}g F:${t.f}g | Fib:${t.fib}g Sug:${t.sug}g Na:${t.na}mg
Avg/day: ${Math.round(t.cal / days)}kcal | P:${Math.round(t.p / days)}g C:${Math.round(t.c / days)}g F:${Math.round(t.f / days)}g`;
}

export const getSystemPrompt = ({
  userProfile,
  currentWeekEntries,
}: SystemPromptProps = {}) => {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const week = format(now, "RRRR-'W'II");
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const todaysEntries = currentWeekEntries
    ? currentWeekEntries.filter((entry) => entry.date === today)
    : [];

  return `You are a nutrition tracking assistant.

## Context
- Today: ${today}
- Current calendar week: ${week} (Monday ${weekStart} to Sunday ${weekEnd})

## Behavior
- Be Concise in you answer.
- If food type or quantity is ambiguous (e.g., "I had some agoites"), ask clarifying question to understand the food item, quantity or meal context, but not too many questions. One question is ideal.



## Week Summary
${renderWeeklySummary(currentWeekEntries ?? [])}

## Today's Meals
${renderTodaysEntries(todaysEntries)}
`;
};

// console.log(
//   getSystemPrompt({
//     userProfile: {
//       name: "Shobhan",
//       weight: "70kg",
//       height: "175cm",
//     },
//     currentWeekEntries: [
//       {
//         calories: 500,
//         protein: 30,
//         carbs: 50,
//         fats: 20,
//         date: format(new Date(), "yyyy-MM-dd"),
//         id: "1",
//         name: "Chicken Salad",
//         createdAt: new Date().toISOString(),
//         fiber: 5,
//         sugar: 8,
//         sodium: 300,
//         note: "Had it for lunch",
//         updatedAt: new Date().toISOString(),
//       },
//       {
//         calories: 200,
//         protein: 30,
//         carbs: 50,
//         fats: 20,
//         date: format(new Date(), "yyyy-MM-dd"),
//         id: "123",
//         name: "Egg Salad",
//         createdAt: new Date().toISOString(),
//         fiber: 5,
//         sugar: 8,
//         sodium: 300,
//         note: "Had it for lunch",
//         updatedAt: new Date().toISOString(),
//       },
//     ],
//   }),
// );
