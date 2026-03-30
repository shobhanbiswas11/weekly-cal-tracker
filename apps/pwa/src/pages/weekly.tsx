import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MacroGrid,
  WeekSelector,
  WeeklyGraph,
  calculatePercentage,
  getCurrentWeek,
  getDayName,
  useWeeklySummary,
} from "@/features/calories";
import { Calendar, Flame, TrendingDown, TrendingUp } from "lucide-react";
import { useSearchParams } from "react-router";

export default function WeeklyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const weekId = searchParams.get("week") || getCurrentWeek();

  const { data: summary, isLoading } = useWeeklySummary(weekId);

  const handleWeekChange = (newWeek: string) => {
    setSearchParams({ week: newWeek });
  };

  if (isLoading || !summary) {
    return <div className="p-4">Loading...</div>;
  }

  const {
    weeklyTotals,
    weeklyCalorieGoal,
    weeklyCaloriesRemaining,
    days,
    averageDailyCalories,
  } = summary;
  const percentage = calculatePercentage(
    weeklyTotals.calories,
    weeklyCalorieGoal,
    false,
  );

  // Find best and worst days
  const daysWithEntries = days.filter((d) => d.entries.length > 0);
  const bestDay =
    daysWithEntries.length > 0
      ? daysWithEntries.reduce((a, b) =>
          a.totals.calories < b.totals.calories ? a : b,
        )
      : null;
  const highestDay =
    daysWithEntries.length > 0
      ? daysWithEntries.reduce((a, b) =>
          a.totals.calories > b.totals.calories ? a : b,
        )
      : null;

  // Determine progress color
  const getProgressColor = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 85) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">
      {/* Week Navigation */}
      <WeekSelector weekId={weekId} onWeekChange={handleWeekChange} />

      {/* Weekly Calorie Progress */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Flame className="size-6 text-orange-500" />
            <span className="text-3xl font-bold tabular-nums">
              {weeklyTotals.calories.toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground">
              / {weeklyCalorieGoal.toLocaleString()}
            </span>
          </div>

          <Progress
            value={weeklyTotals.calories}
            max={weeklyCalorieGoal}
            trackClassName="h-3 rounded-full"
            indicatorClassName={getProgressColor()}
          />

          <p className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {weeklyCaloriesRemaining.toLocaleString()}
            </span>{" "}
            calories remaining this week
          </p>
        </CardContent>
      </Card>

      {/* Daily Breakdown Graph */}
      <WeeklyGraph days={days} />

      {/* Weekly Stats */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="size-4" />
            Weekly Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Average */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Average</span>
            <span className="font-medium tabular-nums">
              {averageDailyCalories.toLocaleString()} kcal
            </span>
          </div>

          {/* Best Day */}
          {bestDay && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="size-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Lowest</span>
              </div>
              <span className="text-sm">
                <span className="font-medium">{getDayName(bestDay.date)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  ({bestDay.totals.calories.toLocaleString()})
                </span>
              </span>
            </div>
          )}

          {/* Highest Day */}
          {highestDay && highestDay.date !== bestDay?.date && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Highest</span>
              </div>
              <span className="text-sm">
                <span className="font-medium">
                  {getDayName(highestDay.date)}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  ({highestDay.totals.calories.toLocaleString()})
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Macro Averages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <MacroGrid totals={weeklyTotals} showExtended size="md" />
        </CardContent>
      </Card>
    </div>
  );
}
