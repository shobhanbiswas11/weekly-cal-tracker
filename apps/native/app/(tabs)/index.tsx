import { StyledSafeAreaView } from "@/components";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { NutrientRow } from "@/components/dashboard/nutrient-row";
import { WeeklyStrip } from "@/components/dashboard/weekly-strip";
import { useSummaryQuery } from "@/hooks";
import {
  calculateNutrientTargets,
  calculateStat,
  getTodayISO,
} from "@weekly-cal/core";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function SummaryDashboard() {
  const { data, isLoading, error, refetch } = useSummaryQuery();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };
  const today = getTodayISO();

  const result = useMemo(() => {
    if (!data?.profile) return null;
    return calculateStat({
      weekId: data.weekId,
      today,
      profile: data.profile,
      mealEntries: data.mealEntries,
      activityEntries: data.activityEntries ?? [],
    });
  }, [data, today]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base text-red-500 text-center">
          Failed to load data. Please try again.
        </Text>
      </View>
    );
  }

  if (!data?.profile || !result) {
    return (
      <View className="flex-1 items-center justify-center px-6 gap-4">
        <Text className="text-xl font-semibold text-foreground text-center">
          Welcome! 👋
        </Text>
        <Text className="text-sm text-muted-foreground text-center max-w-72">
          Set up your vitals so we can calculate your personalized calorie
          goals.
        </Text>
        <Pressable
          onPress={() => router.push("/profile/edit-vitals")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-sm font-semibold text-primary-foreground">
            Set Up Your Vitals
          </Text>
        </Pressable>
      </View>
    );
  }

  const { weeklyStat, dailyStats, dailyCalorieBudget } = result;
  const weekDates = weeklyStat.days.map((d) => d.date);
  const nutrientTargets = calculateNutrientTargets(
    dailyCalorieBudget,
    data.profile.biologicalSex,
  );

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
  const nutrients = todayStat?.nutrientsConsumption;

  return (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View className="mb-1">
        <Text className="text-2xl font-bold text-foreground">
          Good {getGreeting()} 👋
        </Text>
        <Text className="text-sm text-muted-foreground mt-0.5">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      {/* Today card */}
      <View className="bg-card rounded-2xl p-5 shadow-sm">
        {/* Calorie ring */}
        <View className="items-center mb-5">
          <CalorieRing consumed={netConsumed} budget={dailyCalorieBudget} />
        </View>
        {/* 4-column breakdown */}
        <View className="flex-row border-t border-border">
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Budget
            </Text>
            <Text className="text-sm font-bold text-foreground mt-0.5">
              {fmt(dailyCalorieBudget)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Eaten
            </Text>
            <Text className="text-sm font-bold text-foreground mt-0.5">
              {fmt(consumed)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Burned
            </Text>
            <Text className="text-sm font-bold text-primary mt-0.5">
              {fmt(burned)}
            </Text>
          </View>
          <View className="w-px bg-border my-2" />
          <View className="flex-1 items-center pt-3 px-2">
            <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              {net >= 0 ? "Left" : "Over"}
            </Text>
            <Text
              className={`text-sm font-bold mt-0.5 ${net < 0 ? "text-red-500" : "text-primary"}`}
            >
              {fmt(Math.abs(net))}
            </Text>
          </View>
        </View>
      </View>

      {/* This Week card */}
      <View className="bg-card rounded-2xl p-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-medium text-muted-foreground">
            This Week
          </Text>
          <Text
            className={`text-sm font-bold ${weeklyOver ? "text-red-500" : "text-primary"}`}
          >
            {weeklyOver
              ? `${fmt(-weeklyBalance)} kcal over`
              : `${fmt(weeklyBalance)} kcal left`}
          </Text>
        </View>
        <WeeklyStrip weekDates={weekDates} dailyStats={dailyStats} />
        {weeklyOver && (
          <View className="mt-2.5 flex-row items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2">
            <Text className="text-xs text-red-500">
              ⚠ You&apos;re{" "}
              <Text className="font-bold">{fmt(-weeklyBalance)} kcal</Text> over
              your weekly budget.
            </Text>
          </View>
        )}
      </View>

      {/* Nutrients card */}
      <View className="bg-card rounded-2xl p-4 shadow-sm">
        <Text className="text-sm font-medium text-muted-foreground mb-3.5">
          Today&apos;s Nutrients
        </Text>
        <View className="gap-3.5">
          <NutrientRow
            label="Protein"
            consumed={nutrients?.protein ?? 0}
            target={nutrientTargets.protein}
            unit="g"
            color="#3b82f6"
          />
          <NutrientRow
            label="Carbs"
            consumed={nutrients?.carbs ?? 0}
            target={nutrientTargets.carbs}
            unit="g"
            color="#f59e0b"
          />
          <NutrientRow
            label="Fat"
            consumed={nutrients?.fats ?? 0}
            target={nutrientTargets.fats}
            unit="g"
            color="#f97316"
          />
          <NutrientRow
            label="Fiber"
            consumed={nutrients?.fiber ?? 0}
            target={nutrientTargets.fiber}
            unit="g"
            color="#10b981"
          />
          <NutrientRow
            label="Sodium"
            consumed={nutrients?.sodium ?? 0}
            target={nutrientTargets.sodium}
            unit="mg"
            color="#8b5cf6"
          />
        </View>
      </View>
    </ScrollView>
  );
}

export default function Dashboard() {
  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      <SummaryDashboard />
    </StyledSafeAreaView>
  );
}
