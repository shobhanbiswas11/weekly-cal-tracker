import { isCompleteOrCancelledUIFlow, uiFlowActivity } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { useState } from "react";
import { Text, View } from "react-native";
import { useInvalidateWeeklySummaryQuery } from "../../../hooks/use-weekly-summary-query";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";
import type { UIFlowRendererProps } from "./types";

export function DeleteActivity({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { deleteActivity } = useApi();
  const invalidateSummary = useInvalidateWeeklySummaryQuery();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { activityId, date, activityName } =
    uiFlowActivity.delete.getInitPayload(flow);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteActivity(date, activityId);
      invalidateSummary();
      addResult(
        uiFlowActivity.delete.complete("Activity deleted successfully"),
      );
    } catch (error) {
      addResult(
        uiFlowActivity.delete.cancel(
          error instanceof Error ? error.message : "Failed to delete activity",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowActivity.delete.cancel("Deletion cancelled by user"));
  };

  return (
    <FlowCard
      iconName="trash-2"
      iconColorVar="--color-destructive"
      iconBgClass="bg-destructive/10"
      title="Delete Activity"
      subtitle="This action cannot be undone"
    >
      <FlowSection label="Activity to Delete">
        <View className="gap-1 rounded-lg bg-muted/30 p-3">
          <View className="flex-row items-center justify-between py-1.5">
            <Text className="text-sm text-muted-foreground">Name</Text>
            <Text className="text-sm font-medium text-foreground">
              {activityName}
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
