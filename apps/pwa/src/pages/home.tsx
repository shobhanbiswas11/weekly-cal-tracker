import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalorieKPI,
  EntryList,
  MacroGrid,
  useLastWeekSummary,
  useTodaySummary,
} from "@/features/calories";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router";

export default function HomePage() {
  const navigate = useNavigate();
  const { data: todaySummary } = useTodaySummary();
  const { data: lastWeekSummary } = useLastWeekSummary();

  if (!todaySummary || !lastWeekSummary) {
    return <div className="p-4">Loading...</div>;
  }

  const weekConsumed = lastWeekSummary.weeklyTotals.calories;
  const weekGoal = lastWeekSummary.weeklyCalorieGoal;

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Time-based greeting */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground">
          Here's your calorie summary
        </p>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-3">
        <CalorieKPI
          consumed={weekConsumed}
          goal={weekGoal}
          label="Last Week"
          sublabel="Mar 23 - 29"
          size="md"
        />
        <CalorieKPI
          consumed={todaySummary.totals.calories}
          goal={todaySummary.calorieGoal}
          label="Today"
          size="md"
        />
      </div>

      {/* Today's Macros */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today's Macros</CardTitle>
        </CardHeader>
        <CardContent>
          <MacroGrid totals={todaySummary.totals} showProgress size="md" />
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <EntryList
        entries={todaySummary.entries}
        limit={3}
        title="Recent Entries"
        emptyMessage="No entries today. Start logging your meals!"
      />

      {/* Chat Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4">
        <Button
          onClick={() => navigate("/chat")}
          className="w-full h-12 gap-2 text-base shadow-lg"
          size="lg"
        >
          <MessageSquare className="size-5" />
          What did you eat?
        </Button>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
}
