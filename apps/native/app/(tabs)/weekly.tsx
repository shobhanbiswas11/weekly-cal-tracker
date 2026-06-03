import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  IconButton,
  IconButtonIcon,
  StyledSafeAreaView,
} from "@/components";
import { useWeeklySummaryQuery } from "@/hooks";
import type { ActivityEntry, MealEntry } from "@weekly-cal/core";
import {
  calculateStat,
  formatDayShort,
  formatWeekLabel,
  getCurrentWeekId,
  getTodayISO,
  getWeekDates,
  shiftWeek,
} from "@weekly-cal/core";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

// --- Week Header (prev/next chevrons + label) ---

function WeekHeader({
  selectedWeekId,
  currentWeekId,
  onPrev,
  onNext,
  onReturnToCurrentWeek,
}: {
  selectedWeekId: string;
  currentWeekId: string;
  onPrev: () => void;
  onNext: () => void;
  onReturnToCurrentWeek: () => void;
}) {
  const canGoForward = selectedWeekId < currentWeekId;
  const label =
    selectedWeekId === currentWeekId
      ? "This Week"
      : formatWeekLabel(selectedWeekId);

  return (
    <View className="border-b border-border">
      <View className="flex-row items-center justify-center gap-4 px-4 py-3">
        <IconButton onPress={onPrev}>
          <IconButtonIcon name="chevron-back" />
        </IconButton>
        <View className="items-center w-44">
          <Text className="text-base font-semibold text-foreground text-center">
            {label}
          </Text>
          {selectedWeekId === currentWeekId && (
            <Text className="text-xs text-muted-foreground">
              {formatWeekLabel(selectedWeekId)}
            </Text>
          )}
        </View>
        <IconButton onPress={onNext} disabled={!canGoForward}>
          <IconButtonIcon name="chevron-forward" />
        </IconButton>
      </View>
      {selectedWeekId !== currentWeekId && (
        <View className="items-center pb-2">
          <Text
            className="text-xs font-semibold text-primary"
            onPress={onReturnToCurrentWeek}
          >
            Return to This Week
          </Text>
        </View>
      )}
    </View>
  );
}

// --- Day row in the breakdown list ---

function DayRow({
  date,
  consumed,
  burned,
  budget,
  isCurrentWeek,
  isFuture,
}: {
  date: string;
  consumed: number;
  burned: number;
  budget: number;
  isCurrentWeek: boolean;
  isFuture: boolean;
}) {
  const dayLabel = formatDayShort(date);
  const net = budget - consumed + burned;
  const isOver = net < 0;

  return (
    <View
      className={`flex-row items-center py-3 border-b border-border ${isFuture ? "opacity-40" : ""}`}
    >
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground">{dayLabel}</Text>
      </View>
      <View className="w-20 items-end">
        <Text className="text-sm font-semibold text-foreground">
          {isFuture ? "—" : fmt(consumed)}
        </Text>
      </View>
      <View className="w-20 items-end">
        <Text className="text-sm font-semibold text-primary">
          {isFuture || burned === 0 ? "—" : fmt(burned)}
        </Text>
      </View>
      {isCurrentWeek && (
        <View className="w-20 items-end">
          <Text
            className={`text-sm font-semibold ${isFuture ? "text-muted-foreground" : isOver ? "text-red-500" : "text-primary"}`}
          >
            {isFuture ? "—" : isOver ? `+${fmt(-net)}` : `-${fmt(net)}`}
          </Text>
        </View>
      )}
    </View>
  );
}

// --- Weekly content for current week (with budget) ---

function CurrentWeekContent({
  weekId,
  data,
  refreshing,
  onRefresh,
}: {
  weekId: string;
  data: {
    profile: NonNullable<unknown>;
    weekId: string;
    mealEntries: MealEntry[];
    activityEntries: ActivityEntry[];
  };
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const today = getTodayISO();

  const result = useMemo(() => {
    if (!data.profile) return null;
    return calculateStat({
      weekId: data.weekId,
      today,
      profile: data.profile as Parameters<typeof calculateStat>[0]["profile"],
      mealEntries: data.mealEntries,
      activityEntries: data.activityEntries ?? [],
    });
  }, [data, today]);

  if (!result) return null;

  const { weeklyStat, dailyCalorieBudget } = result;
  const weekDates = getWeekDates(weekId);
  const weeklyBalance =
    weeklyStat.calorieBudget -
    weeklyStat.caloriesConsumed +
    weeklyStat.caloriesBurned;
  const weeklyOver = weeklyBalance < 0;

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Weekly totals */}
      <Card>
        <CardHeader>
          <Text className="text-sm font-medium text-muted-foreground">
            Weekly Summary
          </Text>
        </CardHeader>
        <CardFooter className="flex-row">
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Budget
            </Text>
            <Text className="text-sm font-bold text-foreground mt-0.5">
              {fmt(weeklyStat.calorieBudget)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Eaten
            </Text>
            <Text className="text-sm font-bold text-foreground mt-0.5">
              {fmt(weeklyStat.caloriesConsumed)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Burned
            </Text>
            <Text className="text-sm font-bold text-primary mt-0.5">
              {fmt(weeklyStat.caloriesBurned)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              {weeklyOver ? "Over" : "Left"}
            </Text>
            <Text
              className={`text-sm font-bold mt-0.5 ${weeklyOver ? "text-red-500" : "text-primary"}`}
            >
              {fmt(Math.abs(weeklyBalance))}
            </Text>
          </View>
        </CardFooter>
      </Card>

      {/* Per-day breakdown */}
      <Card>
        <CardHeader>
          <Text className="text-sm font-medium text-muted-foreground">
            Daily Breakdown
          </Text>
        </CardHeader>
        <CardContent>
          <View className="flex-row items-center pb-2">
            <View className="flex-1" />
            <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-20 text-right">
              Eaten
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-20 text-right">
              Burned
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-20 text-right">
              Balance
            </Text>
          </View>
          {weekDates.map((date) => {
            const dayMeals = (data.mealEntries ?? []).filter(
              (e) => e.date === date,
            );
            const dayActivities = (data.activityEntries ?? []).filter(
              (e) => e.date === date,
            );
            const consumed = dayMeals.reduce((s, m) => s + m.calories, 0);
            const burned = dayActivities.reduce(
              (s, a) => s + a.caloriesBurned,
              0,
            );
            const isFuture = date > today;

            return (
              <DayRow
                key={date}
                date={date}
                consumed={consumed}
                burned={burned}
                budget={dailyCalorieBudget}
                isCurrentWeek={true}
                isFuture={isFuture}
              />
            );
          })}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

// --- Weekly content for past weeks (raw data only, no budget) ---

function PastWeekContent({
  weekId,
  data,
  refreshing,
  onRefresh,
}: {
  weekId: string;
  data: {
    mealEntries: MealEntry[];
    activityEntries: ActivityEntry[];
  };
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const weekDates = getWeekDates(weekId);

  const totals = useMemo(() => {
    const consumed = (data.mealEntries ?? []).reduce(
      (s, m) => s + m.calories,
      0,
    );
    const burned = (data.activityEntries ?? []).reduce(
      (s, a) => s + a.caloriesBurned,
      0,
    );
    return { consumed, burned };
  }, [data]);

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Weekly totals (no budget for past weeks) */}
      <Card>
        <CardHeader>
          <Text className="text-sm font-medium text-muted-foreground">
            Weekly Summary
          </Text>
        </CardHeader>
        <CardFooter className="flex-row">
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Eaten
            </Text>
            <Text className="text-sm font-bold text-foreground mt-0.5">
              {fmt(totals.consumed)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Burned
            </Text>
            <Text className="text-sm font-bold text-primary mt-0.5">
              {fmt(totals.burned)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Net
            </Text>
            <Text className="text-sm font-bold text-foreground mt-0.5">
              {fmt(totals.consumed - totals.burned)}
            </Text>
          </View>
        </CardFooter>
      </Card>

      {/* Per-day breakdown */}
      <Card>
        <CardHeader>
          <Text className="text-sm font-medium text-muted-foreground">
            Daily Breakdown
          </Text>
        </CardHeader>
        <CardContent>
          <View className="flex-row items-center pb-2">
            <View className="flex-1" />
            <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-20 text-right">
              Eaten
            </Text>
            <Text className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground w-20 text-right">
              Burned
            </Text>
          </View>
          {weekDates.map((date) => {
            const dayMeals = (data.mealEntries ?? []).filter(
              (e) => e.date === date,
            );
            const dayActivities = (data.activityEntries ?? []).filter(
              (e) => e.date === date,
            );
            const consumed = dayMeals.reduce((s, m) => s + m.calories, 0);
            const burned = dayActivities.reduce(
              (s, a) => s + a.caloriesBurned,
              0,
            );

            return (
              <DayRow
                key={date}
                date={date}
                consumed={consumed}
                burned={burned}
                budget={0}
                isCurrentWeek={false}
                isFuture={false}
              />
            );
          })}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

// --- Main screen ---

export default function WeeklyScreen() {
  const currentWeekId = getCurrentWeekId();
  const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId);
  const isCurrentWeek = selectedWeekId === currentWeekId;

  const { data, isLoading, error, refetch } =
    useWeeklySummaryQuery(selectedWeekId);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      <WeekHeader
        selectedWeekId={selectedWeekId}
        currentWeekId={currentWeekId}
        onPrev={() => setSelectedWeekId((w) => shiftWeek(w, -1))}
        onNext={() => setSelectedWeekId((w) => shiftWeek(w, 1))}
        onReturnToCurrentWeek={() => setSelectedWeekId(currentWeekId)}
      />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base text-red-500 text-center">
            Failed to load data. Please try again.
          </Text>
        </View>
      ) : !data ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground text-sm">No data</Text>
        </View>
      ) : isCurrentWeek && data.profile ? (
        <CurrentWeekContent
          weekId={selectedWeekId}
          data={data as Parameters<typeof CurrentWeekContent>[0]["data"]}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <PastWeekContent
          weekId={selectedWeekId}
          data={data}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </StyledSafeAreaView>
  );
}
