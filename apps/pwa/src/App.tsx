import { SignIn } from "@/components/auth/SignIn";
import { DailySummaryCard } from "@/components/DailySummaryCard";
import { DateSelector } from "@/components/DateSelector";
import { EntryList } from "@/components/EntryList";
import { NLInput } from "@/components/NLInput";
import { WeeklySummary } from "@/components/WeeklySummary";
import { useApi } from "@/hooks/useApi";
import type { CalorieEntry, DailySummary } from "@/types";
import { Show, UserButton } from "@clerk/react";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type View = "daily" | "weekly";

function DailyView() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [view, setView] = useState<View>("daily");
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const api = useApi();

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getEntries(selectedDate);
      if (response.success && response.data) {
        setDailySummary(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [api, selectedDate]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleEntriesAdded = (newEntries: CalorieEntry[]) => {
    if (!dailySummary) {
      setDailySummary({
        date: selectedDate,
        entries: newEntries,
        totalCalories: newEntries.reduce((sum, e) => sum + e.calories, 0),
        totalProtein: newEntries.reduce((sum, e) => sum + e.protein, 0),
        totalCarbs: newEntries.reduce((sum, e) => sum + e.carbs, 0),
        totalFat: newEntries.reduce((sum, e) => sum + e.fat, 0),
      });
    } else {
      setDailySummary({
        ...dailySummary,
        entries: [...dailySummary.entries, ...newEntries],
        totalCalories:
          dailySummary.totalCalories +
          newEntries.reduce((sum, e) => sum + e.calories, 0),
        totalProtein:
          dailySummary.totalProtein +
          newEntries.reduce((sum, e) => sum + e.protein, 0),
        totalCarbs:
          dailySummary.totalCarbs +
          newEntries.reduce((sum, e) => sum + e.carbs, 0),
        totalFat:
          dailySummary.totalFat + newEntries.reduce((sum, e) => sum + e.fat, 0),
      });
    }
  };

  const handleEntryDeleted = (entryId: string) => {
    if (!dailySummary) return;
    const deletedEntry = dailySummary.entries.find((e) => e.id === entryId);
    if (!deletedEntry) return;

    setDailySummary({
      ...dailySummary,
      entries: dailySummary.entries.filter((e) => e.id !== entryId),
      totalCalories: dailySummary.totalCalories - deletedEntry.calories,
      totalProtein: dailySummary.totalProtein - deletedEntry.protein,
      totalCarbs: dailySummary.totalCarbs - deletedEntry.carbs,
      totalFat: dailySummary.totalFat - deletedEntry.fat,
    });
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setView("daily");
  };

  if (view === "weekly") {
    return (
      <WeeklySummary
        onBack={() => setView("daily")}
        onSelectDate={handleDateChange}
      />
    );
  }

  return (
    <div className="space-y-4">
      <DateSelector
        date={selectedDate}
        onDateChange={handleDateChange}
        onViewWeekly={() => setView("weekly")}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      ) : (
        <>
          <DailySummaryCard
            totalCalories={dailySummary?.totalCalories ?? 0}
            totalProtein={dailySummary?.totalProtein ?? 0}
            totalCarbs={dailySummary?.totalCarbs ?? 0}
            totalFat={dailySummary?.totalFat ?? 0}
          />

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400 px-1">
              Add Entry
            </h2>
            <NLInput date={selectedDate} onEntriesAdded={handleEntriesAdded} />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-400 px-1">
              Today's Meals
            </h2>
            <EntryList
              entries={dailySummary?.entries ?? []}
              onEntryDeleted={handleEntryDeleted}
            />
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Show when="signed-out">
        <SignIn />
      </Show>
      <Show when="signed-in">
        <div className="min-h-svh bg-zinc-950 text-zinc-50">
          <div className="mx-auto max-w-md px-4 pb-8">
            <header className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/50 -mx-4 px-4 py-4 mb-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Calorie Tracker</h1>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 ring-2 ring-zinc-800",
                    },
                  }}
                />
              </div>
            </header>

            <main className="pt-safe">
              <DailyView />
            </main>
          </div>
        </div>
      </Show>
    </>
  );
}

export default App;
