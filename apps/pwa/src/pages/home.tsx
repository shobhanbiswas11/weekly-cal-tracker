import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  EntryList,
  getToday,
  MacroGrid,
  transformToWeeklySummary,
} from "@/features/calories";
import { ProfileSetupButton, useIsProfileSetupDone } from "@/features/profile";
import { useDashboard } from "@/hooks/dashboard";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Loader2, Plus, Sun } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router";

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

type CardVariant = "today" | "week";

const variantConfig = {
  today: {
    icon: Sun,
    accentColor: "text-amber-500",
    progressColor: "bg-amber-500",
    bgTint: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900/50",
  },
  week: {
    icon: CalendarDays,
    accentColor: "text-blue-500",
    progressColor: "bg-blue-500",
    bgTint: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900/50",
  },
};

// Compact calorie card for dashboard
function CalorieCard({
  consumed,
  goal,
  label,
  variant,
}: {
  consumed: number;
  goal: number;
  label: string;
  variant: CardVariant;
}) {
  const remaining = Math.max(0, goal - consumed);
  const percentage = Math.min((consumed / goal) * 100, 100);
  const config = variantConfig[variant];
  const Icon = config.icon;

  const getStatusColor = () => {
    if (percentage >= 100) return "text-red-500";
    if (percentage >= 80) return "text-amber-500";
    return "text-green-500";
  };

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return config.progressColor;
  };

  return (
    <Card className={cn(config.bgTint, config.borderColor)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          <Icon className={cn("size-4", config.accentColor)} />
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-2xl font-bold tabular-nums">
            {consumed.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            / {goal.toLocaleString()}
          </span>
        </div>

        <Progress
          value={percentage}
          max={100}
          className="h-2"
          indicatorClassName={getProgressColor()}
        />

        <p className={cn("text-xs font-medium mt-1.5", getStatusColor())}>
          {remaining > 0
            ? `${remaining.toLocaleString()} left`
            : "Goal reached!"}
        </p>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  const { isLoading, data } = useDashboard();
  const isProfileSetupDone = useIsProfileSetupDone();

  // Transform API data into structured weekly summary
  const weeklySummary = useMemo(() => {
    if (!data) return null;
    return transformToWeeklySummary(data.weekId, data.entries);
  }, [data]);

  // Get today's summary from the week
  const todaySummary = useMemo(() => {
    if (!weeklySummary) return null;
    const today = getToday();
    return weeklySummary.days.find((d) => d.date === today) ?? null;
  }, [weeklySummary]);

  // Get all entries from the week for recent entries list
  const allEntries = useMemo(() => {
    if (!weeklySummary) return [];
    return weeklySummary.days.flatMap((d) => d.entries);
  }, [weeklySummary]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <div>data loading failed</div>;
  }

  if (!isProfileSetupDone) {
    return <ProfileSetupButton />;
  }

  return (
    <div className="relative h-full overflow-auto">
      <div className="p-4 pb-20 space-y-4">
        {/* Greeting Header */}
        <div className="space-y-0.5">
          <h1 className="text-xl font-semibold">Good {getGreeting()}!</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>

        {/* KPI Cards - Today & Week */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/daily">
            <CalorieCard
              consumed={todaySummary?.totals.calories ?? 0}
              goal={todaySummary?.calorieGoal ?? 2000}
              label="Today"
              variant="today"
            />
          </Link>
          <Link to="/weekly">
            <CalorieCard
              consumed={weeklySummary?.weeklyTotals.calories ?? 0}
              goal={weeklySummary?.weeklyCalorieGoal ?? 14000}
              label="This Week"
              variant="week"
            />
          </Link>
        </div>

        {/* Today's Macros */}
        {todaySummary && (
          <div className="rounded-lg border bg-card p-4">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              Today's Macros
            </h2>
            <MacroGrid totals={todaySummary.totals} showProgress size="sm" />
          </div>
        )}

        {/* Recent Entries */}
        <EntryList
          entries={allEntries}
          limit={5}
          showMacros
          title="Recent Entries"
          emptyMessage="No meals logged yet. Tap + to log your first meal!"
        />
      </div>

      {/* Floating Action Button */}
      <Link to="/chat">
        <Button
          size="icon"
          className="fixed bottom-20 right-4 size-14 rounded-full shadow-lg"
        >
          <Plus className="size-6" />
          <span className="sr-only">Log a meal</span>
        </Button>
      </Link>
    </div>
  );
}
