import { Ionicons } from "@expo/vector-icons";
import type { ActivityLevel, Goal } from "@weekly-cal/core";
import { ScrollView, Text, View } from "react-native";
import { Modal, ModalClose, ModalContent, ModalTrigger } from "../ui/modal";

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

function goalLabel(goal: Goal): string {
  if (goal === "Lose Weight") return "Lose Weight (TDEE − 500)";
  if (goal === "Gain Weight") return "Gain Weight (TDEE + 500)";
  return "Maintain Healthy Lifestyle (= TDEE)";
}

function InfoBlock({
  step,
  title,
  description,
  value,
}: {
  step: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2">
        <View className="w-5 h-5 rounded-full bg-primary/15 items-center justify-center">
          <Text className="text-[10px] font-bold text-primary">{step}</Text>
        </View>
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
      </View>
      <Text className="text-xs text-muted-foreground leading-5 pl-7">
        {description}
      </Text>
      <View className="ml-7 mt-0.5 bg-primary/10 rounded-lg px-3 py-1.5">
        <Text className="text-xs font-semibold text-primary">{value}</Text>
      </View>
    </View>
  );
}

export function CalorieInfoModal({
  bmr,
  tdee,
  dailyCalorieBudget,
  activityLevel,
  goal,
}: {
  bmr: number;
  tdee: number;
  dailyCalorieBudget: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}) {
  return (
    <Modal>
      <ModalTrigger>
        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#6b7280"
          />
          <Text className="text-xs text-muted-foreground">
            How is this calculated?
          </Text>
        </View>
      </ModalTrigger>
      <ModalContent>
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 20 }}
          showsVerticalScrollIndicator={false}
          className="flex-1"
        >
          {/* Step 1: BMR */}
          <InfoBlock
            step="1"
            title="BMR — Basal Metabolic Rate"
            description="The calories your body burns at complete rest — just to breathe, pump blood, and stay alive. Calculated from your height, weight, age, and biological sex using the Mifflin-St Jeor equation."
            value={`Your BMR: ${fmt(bmr)} kcal / day`}
          />

          {/* Step 2: TDEE */}
          <InfoBlock
            step="2"
            title="TDEE — Total Daily Energy Expenditure"
            description={`Your BMR multiplied by an activity factor based on your lifestyle (${activityLevel}). This accounts for all the energy you burn on a typical day — not just at rest.`}
            value={`Your TDEE: ${fmt(tdee)} kcal / day`}
          />

          {/* Step 3: Budget */}
          <InfoBlock
            step="3"
            title="Your Daily Budget"
            description={`Adjusted from TDEE based on your goal: ${goalLabel(goal)}.`}
            value={`Your budget: ${fmt(dailyCalorieBudget)} kcal / day`}
          />

          {/* Step 4: Net */}
          <View className="gap-1.5">
            <View className="flex-row items-center gap-2">
              <View className="w-5 h-5 rounded-full bg-primary/15 items-center justify-center">
                <Text className="text-[10px] font-bold text-primary">4</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">
                Your Net for Today
              </Text>
            </View>
            <Text className="text-xs text-muted-foreground leading-5 pl-7">
              We subtract the calories you&apos;ve eaten from your budget, then
              add back whatever you&apos;ve burned through activity. That gives
              you your remaining calories for the day.
            </Text>
            <View className="ml-7 mt-0.5 bg-muted/50 rounded-lg px-3 py-1.5">
              <Text className="text-xs font-mono text-foreground">
                Net = Budget − Eaten + Burned
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="border-t border-border py-3 items-center">
          <ModalClose>
            <Text className="text-sm font-semibold text-primary">Close</Text>
          </ModalClose>
        </View>
      </ModalContent>
    </Modal>
  );
}
