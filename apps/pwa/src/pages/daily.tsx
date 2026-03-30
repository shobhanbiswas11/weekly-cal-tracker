import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import {
  calculatePercentage,
  DailyCalendar,
  DEFAULT_GOALS,
  EntryList,
  getToday,
  MacroGrid,
  Suggestions,
  useEntries,
} from "@/features/calories";
import { Flame } from "lucide-react";
import { useSearchParams } from "react-router";

export default function DailyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date") || getToday();

  const { data: summary, isLoading } = useEntries(date);

  const handleDateChange = (newDate: string) => {
    setSearchParams({ date: newDate });
  };

  if (isLoading || !summary) {
    return <div className="p-4">Loading...</div>;
  }

  const { totals, calorieGoal, caloriesRemaining, entries } = summary;
  const percentage = calculatePercentage(totals.calories, calorieGoal, false);

  // Determine progress color
  const getProgressColor = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {/* Date Navigation */}
      <DailyCalendar date={date} onDateChange={handleDateChange} />

      {/* Calorie Progress */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Flame className="size-6 text-orange-500" />
            <span className="text-3xl font-bold tabular-nums">
              {totals.calories.toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground">
              / {calorieGoal.toLocaleString()}
            </span>
          </div>

          <Progress value={totals.calories} max={calorieGoal}>
            <ProgressTrack className="h-3 rounded-full">
              <ProgressIndicator className={getProgressColor()} />
            </ProgressTrack>
          </Progress>

          <p className="text-center text-sm">
            {caloriesRemaining > 0 ? (
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {caloriesRemaining.toLocaleString()}
                </span>{" "}
                calories remaining
              </span>
            ) : (
              <span className="text-red-500 font-medium">
                {Math.abs(totals.calories - calorieGoal).toLocaleString()} over
                goal
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* Macros with Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <MacroGrid
            totals={totals}
            goals={DEFAULT_GOALS}
            showProgress
            showExtended
            size="md"
          />
        </CardContent>
      </Card>

      {/* Entry List */}
      <EntryList
        entries={entries}
        showMacros
        title="Today's Entries"
        emptyMessage="No entries for this day"
      />

      {/* Suggestions */}
      <Suggestions summary={summary} />
    </div>
  );
}
