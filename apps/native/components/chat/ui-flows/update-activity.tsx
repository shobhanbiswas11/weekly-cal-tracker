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

const fieldLabels: Record<string, string> = {
  name: "Name",
  date: "Date",
  caloriesBurned: "Calories Burned",
  note: "Note",
};

function formatValue(field: string, value: string): string {
  if (value === null || value === undefined) return "—";
  if (field === "caloriesBurned") return `${value} kcal`;
  return String(value);
}

function changesToObject(
  changes: Array<{ field: string; value: string }>,
): Record<string, unknown> {
  return changes.reduce(
    (acc, { field, value }) => {
      acc[field] = field === "caloriesBurned" ? Number(value) : value;
      return acc;
    },
    {} as Record<string, unknown>,
  );
}

export function UpdateActivity({ addResult, flow }: UIFlowRendererProps) {
  const [loading, setLoading] = useState(false);
  const { updateActivity } = useApi();
  const invalidateSummary = useInvalidateWeeklySummaryQuery();

  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { activityId, date, activityName, changes } =
    uiFlowActivity.update.getInitPayload(flow);

  const hasChanges = changes.length > 0;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await updateActivity(date, activityId, changesToObject(changes));
      invalidateSummary();
      addResult(
        uiFlowActivity.update.complete("Activity updated successfully"),
      );
    } catch (error) {
      addResult(
        uiFlowActivity.update.cancel(
          error instanceof Error ? error.message : "Failed to update activity",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    addResult(uiFlowActivity.update.cancel("Update cancelled by user"));
  };

  return (
    <FlowCard
      iconName="edit-2"
      iconColorVar="--color-foreground"
      iconBgClass="bg-amber-500/10"
      title="Update Activity"
      subtitle={`${activityName} · ${date}`}
    >
      {hasChanges && (
        <FlowSection label="Proposed Changes">
          <View className="gap-1 rounded-lg bg-muted/30 p-3">
            {changes.map(
              (change: { field: string; value: string }, index: number) => (
                <View
                  key={`${change.field}-${index}`}
                  className="flex-row items-center justify-between py-1.5"
                >
                  <Text className="text-sm text-muted-foreground">
                    {fieldLabels[change.field] ?? change.field}
                  </Text>
                  <Text className="text-sm font-medium text-foreground">
                    {formatValue(change.field, change.value)}
                  </Text>
                </View>
              ),
            )}
          </View>
        </FlowSection>
      )}

      <FlowActionButtons
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        cancelLabel="Discard"
        confirmLabel="Confirm"
        loading={loading}
      />
    </FlowCard>
  );
}
