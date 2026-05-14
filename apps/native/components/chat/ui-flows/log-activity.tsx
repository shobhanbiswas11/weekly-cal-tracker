import { isCompleteOrCancelledUIFlow, uiFlowActivity } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";
import { useState } from "react";
import { Text, View } from "react-native";
import { useInvalidateSummaryQuery } from "../../../hooks/use-summary-query";
import { FlowActionButtons, FlowCard, FlowResultCard } from "./common";
import type { UIFlowRendererProps } from "./types";

function formatNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
}

export function LogActivity({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { createActivity } = useApi();
  const invalidateSummary = useInvalidateSummaryQuery();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { name, date, caloriesBurned, note } =
    uiFlowActivity.log.getInitPayload(flow);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await createActivity({
        name,
        date,
        caloriesBurned,
        note,
      });
      invalidateSummary();
      addResult(uiFlowActivity.log.complete("Activity logged successfully"));
    } catch (error) {
      addResult(
        uiFlowActivity.log.cancel(
          error instanceof Error ? error.message : "Failed to log activity",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowActivity.log.cancel("Activity log cancelled by user"));
  };

  return (
    <FlowCard
      iconName="activity"
      iconColorVar="--color-primary"
      iconBgClass="bg-primary/10"
      title={name}
      subtitle={date}
    >
      <View className="gap-2 rounded-lg bg-muted/30 p-3">
        <View className="flex-row items-center justify-between py-1">
          <Text className="text-sm text-muted-foreground">Calories Burned</Text>
          <Text className="text-sm font-semibold text-foreground">
            {formatNumber(caloriesBurned)} kcal
          </Text>
        </View>
        {note && (
          <View className="flex-row items-center justify-between py-1">
            <Text className="text-sm text-muted-foreground">Note</Text>
            <Text className="text-sm font-medium text-foreground">{note}</Text>
          </View>
        )}
      </View>

      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Discard"
        confirmLabel="Log Activity"
        loading={loading}
      />
    </FlowCard>
  );
}
