import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalorieKPI,
  EntryList,
  MacroGrid,
  useDashboardSummary,
} from "@/features/calories";
import { MessageSquare, UserCircle } from "lucide-react";
import { useNavigate } from "react-router";

export default function HomePage() {
  const navigate = useNavigate();
  const summary = useDashboardSummary();

  if (summary.isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!summary.hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center min-h-[60vh]">
        <UserCircle className="size-16 text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Set Up Your Profile</h1>
          <p className="text-muted-foreground max-w-sm">
            To start tracking your calories, please set up your profile with
            your goals first.
          </p>
        </div>
        <Button onClick={() => navigate("/profile")} size="lg">
          Set Up Profile
        </Button>
      </div>
    );
  }

  const {
    weekId,
    calorieGoal,
    weekGoal,
    todayEntries,
    todayTotals,
    weekTotals,
  } = summary;

  return (
    <div className="flex flex-col gap-4 p-4 pb-32">
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
          consumed={weekTotals.calories}
          goal={weekGoal}
          label="This Week"
          sublabel={weekId}
          size="md"
        />
        <CalorieKPI
          consumed={todayTotals.calories}
          goal={calorieGoal}
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
          <MacroGrid totals={todayTotals} showProgress size="md" />
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <EntryList
        entries={todayEntries}
        limit={3}
        title="Recent Entries"
        emptyMessage="No entries today. Start logging your meals!"
      />

      {/* Chat Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t">
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
