import { NutrientRow } from "@/components/nutrient-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSummaryQuery } from "@/hooks/use-summary-query";
import { cn, fmt } from "@/lib/utils";
import {
  calculateNutrientTargets,
  calculateStat,
  getTodayISO,
} from "@weekly-cal/core";
import { AlertTriangle, Beef, Droplets, Leaf, Wheat } from "lucide-react";
import { useMemo } from "react";
import { CalorieRing } from "./calorie-ring";
import { NoProfileState } from "./no-profile-state";
import { getGreeting } from "./utils";
import { WeeklyStrip } from "./weekly-strip";

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PageHome() {
  const { data } = useSummaryQuery();
  const today = getTodayISO();

  const result = useMemo(() => {
    if (!data.profile) return null;
    return calculateStat({
      weekId: data.weekId,
      today,
      profile: data.profile,
      mealEntries: data.mealEntries,
      activityEntries: [],
    });
  }, [data, today]);

  if (!data.profile || !result) return <NoProfileState />;

  const { weeklyStat, dailyStats, dailyCalorieBudget } = result;
  const weekDates = weeklyStat.days.map((d) => d.date);
  const nutrientTargets = calculateNutrientTargets(
    dailyCalorieBudget,
    data.profile.biologicalSex,
  );

  // positive = under budget, negative = over budget
  const weeklyBalance =
    weeklyStat.calorieBudget -
    weeklyStat.caloriesConsumed +
    weeklyStat.caloriesBurned;
  const weeklyOver = weeklyBalance < 0;

  const todayStat = dailyStats.find((d) => d.date === today);
  const consumed = todayStat?.caloriesConsumed ?? 0;
  const burned = todayStat?.caloriesBurned ?? 0;
  const netConsumed = consumed - burned;
  const net = dailyCalorieBudget - netConsumed;

  const {
    protein: proteinTarget,
    carbs: carbTarget,
    fats: fatTarget,
    fiber: fiberTarget,
    sodium: sodiumTarget,
  } = nutrientTargets;
  const nutrients = todayStat?.nutrientsConsumption;

  return (
    <div className="mx-auto max-w-lg space-y-4 overflow-y-auto px-4 py-6 pb-8">
      {/* Greeting */}
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Good {getGreeting()} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ── Today ──────────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-col items-center gap-5 pb-6 pt-6">
          <CalorieRing
            consumed={netConsumed}
            budget={dailyCalorieBudget}
            size={168}
          />
          {/* 3-column breakdown */}
          <div className="grid w-full grid-cols-3 divide-x divide-border text-center">
            <div className="flex flex-col gap-0.5 px-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Budget
              </span>
              <span className="text-sm font-bold tabular-nums">
                {fmt(dailyCalorieBudget)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Eaten
              </span>
              <span className="text-sm font-bold tabular-nums">
                {fmt(consumed)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 px-2">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {net >= 0 ? "Left" : "Over"}
              </span>
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  net < 0 ? "text-destructive" : "text-emerald-500",
                )}
              >
                {fmt(Math.abs(net))}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── This Week ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                weeklyOver ? "text-destructive" : "text-emerald-500",
              )}
            >
              {weeklyOver
                ? `${fmt(-weeklyBalance)} kcal over`
                : `${fmt(weeklyBalance)} kcal left`}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0">
          <WeeklyStrip weekDates={weekDates} dailyStats={dailyStats} />
          {weeklyOver && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>
                You're <strong>{fmt(-weeklyBalance)} kcal</strong> over your
                weekly budget.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Nutrients ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today's Nutrients
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 pt-0">
          <NutrientRow
            icon={<Beef className="h-3 w-3" />}
            label="Protein"
            consumed={nutrients?.protein ?? 0}
            target={proteinTarget}
            unit="g"
            color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
          />
          <NutrientRow
            icon={<Wheat className="h-3 w-3" />}
            label="Carbs"
            consumed={nutrients?.carbs ?? 0}
            target={carbTarget}
            unit="g"
            color="bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300"
          />
          <NutrientRow
            icon={<Droplets className="h-3 w-3" />}
            label="Fat"
            consumed={nutrients?.fats ?? 0}
            target={fatTarget}
            unit="g"
            color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
          />
          <NutrientRow
            icon={<Leaf className="h-3 w-3" />}
            label="Fiber"
            consumed={nutrients?.fiber ?? 0}
            target={fiberTarget}
            unit="g"
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
          />
          <NutrientRow
            icon={<AlertTriangle className="h-3 w-3" />}
            label="Sodium"
            consumed={nutrients?.sodium ?? 0}
            target={sodiumTarget}
            unit="mg"
            color="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300"
          />
        </CardContent>
      </Card>
    </div>
  );
}
