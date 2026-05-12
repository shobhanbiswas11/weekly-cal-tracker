import { isCompleteOrCancelledUIFlow, uiFlowMeal } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { useState } from "react";
import { Text, View } from "react-native";
import { useInvalidateSummaryQuery } from "../../../hooks/use-summary-query";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";
import type { UIFlowRendererProps } from "./types";

export function DeleteMeal({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { deleteEntry } = useApi();
  const invalidateSummary = useInvalidateSummaryQuery();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { mealId, date, mealName } = uiFlowMeal.delete.getInitPayload(flow);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteEntry(date, mealId);
      invalidateSummary();
      addResult(uiFlowMeal.delete.complete("Meal deleted successfully"));
    } catch (error) {
      addResult(
        uiFlowMeal.delete.cancel(
          error instanceof Error ? error.message : "Failed to delete meal",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowMeal.delete.cancel("Deletion cancelled by user"));
  };

  return (
    <FlowCard
      iconName="trash-2"
      iconColorVar="--color-destructive"
      iconBgClass="bg-destructive/10"
      title="Delete Meal"
      subtitle="This action cannot be undone"
    >
      <FlowSection label="Meal to Delete">
        <View className="gap-1 rounded-lg bg-muted/30 p-3">
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-muted-foreground">Name</Text>
            <Text className="text-sm font-medium text-foreground">
              {mealName}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-muted-foreground">Date</Text>
            <Text className="text-sm font-medium text-foreground">{date}</Text>
          </View>
        </View>
      </FlowSection>

      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        isDestructive
        loading={loading}
      />
    </FlowCard>
  );
}
