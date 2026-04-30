import { LoadingState, ReceiptCard, ToolUIWrapper } from "@/components/tool-ui";
import type { ToolCallMessagePartProps, Toolkit } from "@assistant-ui/react";
import { isUIFlow } from "@weekly-cal/core";
import { renderUIFlow } from "./ui-flows/registry";

function SubAgentUI({
  title,
  toolCallProps,
}: {
  title: string;
  toolCallProps: ToolCallMessagePartProps;
}) {
  const { result, status } = toolCallProps;

  if (status.type === "running") {
    return <LoadingState title={`${title} is working...`} />;
  }

  if (isUIFlow(result)) {
    return (
      <ToolUIWrapper>
        {renderUIFlow({
          flow: result,
          ...toolCallProps,
        })}
      </ToolUIWrapper>
    );
  }

  return <ReceiptCard title={title} />;
}

export const toolkit: Toolkit = {
  profileAgent: {
    type: "backend",
    render: (props) => (
      <SubAgentUI title="Profile Agent" toolCallProps={props} />
    ),
  },
  mealAgent: {
    type: "backend",
    render: (props) => <SubAgentUI title="Meal Agent" toolCallProps={props} />,
  },
};
