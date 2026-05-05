import { useInvalidateSummaryQuery } from "@/hooks/use-summary-query";
import { deleteEntry } from "@/lib/api";
import { isCompleteOrCancelledUIFlow, uiFlowMeal } from "@weekly-cal/core";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { UIFlowRendererProps } from "../types";
import {
  FlowActionButtons,
  FlowCard,
  FlowResultCard,
  FlowSection,
} from "./common";

export const DeleteMeal = ({ addResult, flow }: UIFlowRendererProps) => {
  const [loading, setLoading] = useState(false);
  const invalidateSummary = useInvalidateSummaryQuery();

  // Show result state for completed or cancelled
  if (isCompleteOrCancelledUIFlow(flow)) {
    return <FlowResultCard state={flow.state} message={flow.message} />;
  }

  const { mealId, date, mealName } = uiFlowMeal.delete.getInitPayload(flow);

  // Handle confirm - call API and add result
  const handleConfirm = async () => {
    setLoading(true);
    try {
      await deleteEntry(date, mealId);
      invalidateSummary();
      addResult(uiFlowMeal.delete.complete("Meal deleted successfully"));
    } catch (error) {
      console.log(error);
      addResult(
        uiFlowMeal.delete.cancel(
          error instanceof Error ? error.message : "Failed to delete meal",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    addResult(uiFlowMeal.delete.cancel("Deletion cancelled by user"));
  };

  return (
    <FlowCard
      icon={Trash2}
      iconColorClass="bg-destructive/10 text-destructive"
      title="Delete Meal"
      subtitle="This action cannot be undone"
    >
      {/* Meal Info */}
      <FlowSection label="Meal to Delete">
        <div className="space-y-1 rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{mealName}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{date}</span>
          </div>
        </div>
      </FlowSection>

      {/* Action Buttons */}
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
};
