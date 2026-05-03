type DayEntry = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: number;
};

export function getDayTotals(entries: DayEntry[], date: string) {
  return entries
    .filter((e) => e.date === date)
    .reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: acc.protein + e.protein,
        carbs: acc.carbs + e.carbs,
        fats: acc.fats + e.fats,
        fiber: acc.fiber + e.fiber,
        sodium: acc.sodium + e.sodium,
        count: acc.count + 1,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sodium: 0,
        count: 0,
      },
    );
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
