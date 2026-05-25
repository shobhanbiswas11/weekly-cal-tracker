import {
  CalendarPickerModal,
  IconButton,
  IconButtonIcon,
  StyledSafeAreaView,
} from "@/components";
import { useSummaryQuery } from "@/hooks/use-summary-query";
import { Ionicons } from "@expo/vector-icons";
import type { ActivityEntry, MealEntry } from "@weekly-cal/core";
import { formatDateLabel, getTodayISO, shiftDay } from "@weekly-cal/core";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

// --- Macro chip (used in meal detail) ---

function MacroChip({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <View className="flex-1 items-center rounded-xl bg-muted/30 px-1.5 py-2.5 gap-0.5">
      <Text className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </Text>
      <Text className="text-sm font-bold text-foreground">{value}</Text>
      <Text className="text-[10px] text-muted-foreground">{unit}</Text>
    </View>
  );
}

// --- Meal detail bottom sheet ---

function MealDetailModal({
  meal,
  onClose,
}: {
  meal: MealEntry | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={meal !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop — tap to dismiss */}
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        {/* Sheet — absorb touches so backdrop doesn't close */}
        <Pressable>
          <View className="bg-card rounded-t-3xl px-5 pt-5 pb-10 gap-4">
            {/* Handle + close */}
            <View className="items-center mb-1">
              <View className="w-9 h-1 rounded-full bg-border" />
            </View>
            <View className="flex-row items-start justify-between">
              <Text className="text-base font-bold text-foreground flex-1 mr-3">
                {meal?.name}
              </Text>
              <IconButton onPress={onClose}>
                <IconButtonIcon name="close" />
              </IconButton>
            </View>

            {/* Macro chips */}
            <View className="flex-row gap-2">
              <MacroChip
                label="Calories"
                value={fmt(meal?.calories ?? 0)}
                unit="kcal"
              />
              <MacroChip
                label="Protein"
                value={fmt(meal?.protein ?? 0)}
                unit="g"
              />
              <MacroChip label="Carbs" value={fmt(meal?.carbs ?? 0)} unit="g" />
              <MacroChip label="Fat" value={fmt(meal?.fats ?? 0)} unit="g" />
            </View>

            {/* Food items */}
            {meal?.foodItems && meal.foodItems.length > 0 ? (
              <View className="gap-2">
                <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Food Items
                </Text>
                <View className="gap-1.5">
                  {meal.foodItems.map((fi, i) => (
                    <View key={i} className="flex-row justify-between">
                      <Text className="text-sm text-foreground">{fi.name}</Text>
                      <Text className="text-sm text-muted-foreground">
                        {fi.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Note */}
            {meal?.note ? (
              <View className="rounded-xl bg-muted/30 px-3 py-2.5">
                <Text className="text-xs text-muted-foreground">
                  {meal.note}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- Activity detail bottom sheet ---

function ActivityDetailModal({
  activity,
  onClose,
}: {
  activity: ActivityEntry | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={activity !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}
      >
        <Pressable>
          <View className="bg-card rounded-t-3xl px-5 pt-5 pb-10 gap-4">
            <View className="items-center mb-1">
              <View className="w-9 h-1 rounded-full bg-border" />
            </View>
            <View className="flex-row items-start justify-between">
              <Text className="text-base font-bold text-foreground flex-1 mr-3">
                {activity?.name}
              </Text>
              <IconButton onPress={onClose}>
                <IconButtonIcon name="close" />
              </IconButton>
            </View>

            <View>
              <Text className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                Calories Burned
              </Text>
              <Text className="text-2xl font-bold text-primary">
                {fmt(activity?.caloriesBurned ?? 0)} kcal
              </Text>
            </View>

            {activity?.note ? (
              <View className="rounded-xl bg-muted/30 px-3 py-2.5">
                <Text className="text-xs text-muted-foreground">
                  {activity.note}
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- List rows ---

function MealRow({
  entry,
  onPress,
}: {
  entry: MealEntry;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      className="flex-row items-center justify-between py-3 border-b border-border"
    >
      <View className="flex-1 mr-3">
        <Text className="text-sm font-medium text-foreground">
          {entry.name}
        </Text>
        {entry.note ? (
          <Text
            className="text-xs text-muted-foreground mt-0.5"
            numberOfLines={1}
          >
            {entry.note}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-semibold text-foreground">
          {fmt(entry.calories)} kcal
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
      </View>
    </Pressable>
  );
}

function ActivityRow({
  entry,
  onPress,
}: {
  entry: ActivityEntry;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      className="flex-row items-center justify-between py-3 border-b border-border"
    >
      <View className="flex-1 mr-3">
        <Text className="text-sm font-medium text-foreground">
          {entry.name}
        </Text>
        {entry.note ? (
          <Text
            className="text-xs text-muted-foreground mt-0.5"
            numberOfLines={1}
          >
            {entry.note}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center gap-1">
        <Text className="text-sm font-semibold text-primary">
          -{fmt(entry.caloriesBurned)} kcal
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#9ca3af" />
      </View>
    </Pressable>
  );
}

// --- Content ---

function DailyContent({ selectedDate }: { selectedDate: string }) {
  const { data, isLoading, error, refetch } = useSummaryQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealEntry | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityEntry | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const todayMeals = useMemo(
    () => (data?.mealEntries ?? []).filter((e) => e.date === selectedDate),
    [data, selectedDate],
  );

  const todayActivities = useMemo(
    () => (data?.activityEntries ?? []).filter((e) => e.date === selectedDate),
    [data, selectedDate],
  );

  const totalConsumed = useMemo(
    () => todayMeals.reduce((sum, e) => sum + e.calories, 0),
    [todayMeals],
  );

  const totalBurned = useMemo(
    () => todayActivities.reduce((sum, e) => sum + e.caloriesBurned, 0),
    [todayActivities],
  );

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

  return (
    <>
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
        {/* Meals card */}
        <View className="bg-card rounded-2xl px-4 pt-4 pb-1 shadow-sm">
          <View className="flex-row justify-between items-baseline mb-3">
            <Text className="text-base font-semibold text-foreground">
              Meals
            </Text>
            <Text className="text-sm font-bold text-foreground">
              {fmt(totalConsumed)} kcal
            </Text>
          </View>
          {todayMeals.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="text-sm text-muted-foreground">
                No meals logged yet
              </Text>
            </View>
          ) : (
            todayMeals.map((entry) => (
              <MealRow
                key={entry.id}
                entry={entry}
                onPress={() => setSelectedMeal(entry)}
              />
            ))
          )}
        </View>

        {/* Activity card */}
        <View className="bg-card rounded-2xl px-4 pt-4 pb-1 shadow-sm">
          <View className="flex-row justify-between items-baseline mb-3">
            <Text className="text-base font-semibold text-foreground">
              Activity
            </Text>
            {totalBurned > 0 ? (
              <Text className="text-sm font-bold text-primary">
                -{fmt(totalBurned)} kcal burned
              </Text>
            ) : (
              <Text className="text-sm text-muted-foreground">
                0 kcal burned
              </Text>
            )}
          </View>
          {todayActivities.length === 0 ? (
            <View className="py-6 items-center">
              <Text className="text-sm text-muted-foreground">
                No activity logged yet
              </Text>
            </View>
          ) : (
            todayActivities.map((entry) => (
              <ActivityRow
                key={entry.id}
                entry={entry}
                onPress={() => setSelectedActivity(entry)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <MealDetailModal
        meal={selectedMeal}
        onClose={() => setSelectedMeal(null)}
      />
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}

// --- Date navigation header ---

function DateHeader({
  selectedDate,
  today,
  onPrev,
  onNext,
  onDatePress,
}: {
  selectedDate: string;
  today: string;
  onPrev: () => void;
  onNext: () => void;
  onDatePress: () => void;
}) {
  const canGoForward = selectedDate < today;
  return (
    <View className="flex-row items-center justify-center gap-4 px-4 py-3 border-b border-border">
      <IconButton onPress={onPrev}>
        <IconButtonIcon name="chevron-back" />
      </IconButton>
      <Pressable
        onPress={onDatePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        className="flex-row items-center gap-1.5"
      >
        <Text className="text-base font-semibold text-foreground w-36 text-center">
          {formatDateLabel(selectedDate, today)}
        </Text>
        <Ionicons name="calendar-outline" size={15} color="#9ca3af" />
      </Pressable>
      <IconButton onPress={onNext} disabled={!canGoForward}>
        <IconButtonIcon name="chevron-forward" />
      </IconButton>
    </View>
  );
}

// --- Screen ---

export default function DailyScreen() {
  const today = getTodayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarVisible, setCalendarVisible] = useState(false);

  return (
    <StyledSafeAreaView edges={["top"]} className="flex-1 bg-background">
      <DateHeader
        selectedDate={selectedDate}
        today={today}
        onPrev={() => setSelectedDate((d) => shiftDay(d, -1))}
        onNext={() => setSelectedDate((d) => shiftDay(d, +1))}
        onDatePress={() => setCalendarVisible(true)}
      />
      <DailyContent selectedDate={selectedDate} />
      <CalendarPickerModal
        visible={calendarVisible}
        selectedDate={selectedDate}
        today={today}
        onSelect={setSelectedDate}
        onClose={() => setCalendarVisible(false)}
      />
    </StyledSafeAreaView>
  );
}
