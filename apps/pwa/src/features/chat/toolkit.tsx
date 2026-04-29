import { LoadingState, ReceiptCard, ToolUIWrapper } from "@/components/tool-ui";
import type { Toolkit } from "@assistant-ui/react";
import { isUIFlow, isUIFlowAutoCancel } from "@weekly-cal/core";
import { renderUIFlow } from "./ui-flow-registry";

export const toolkit: Toolkit = {
  profileAgent: {
    type: "backend",
    render: (props) => {
      const { result, status } = props;
      const isLoading = status.type === "running";

      if (isLoading) {
        return <LoadingState title="Profile agent is working..." />;
      }

      if (isUIFlowAutoCancel(result)) {
        return <ReceiptCard title="Cancelled" variant="error" />;
      }

      if (isUIFlow(result)) {
        return <ToolUIWrapper>{renderUIFlow(result, props)}</ToolUIWrapper>;
      }

      return <ReceiptCard title="Profile Agent" />;
    },
  },
  mealAgent: {
    type: "backend",
    render: (props) => {
      const { result, status } = props;
      const isLoading = status.type === "running";

      if (isLoading) {
        return <LoadingState title="Meal agent is working..." />;
      }

      if (isUIFlowAutoCancel(result)) {
        return <ReceiptCard title="Cancelled" variant="error" />;
      }

      if (isUIFlow(result)) {
        return <ToolUIWrapper>{renderUIFlow(result, props)}</ToolUIWrapper>;
      }

      return <ReceiptCard title="Meal Agent" />;
    },
  },
};
