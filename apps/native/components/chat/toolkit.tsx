import type {
  ToolCallMessagePartProps,
  Toolkit,
} from "@assistant-ui/react-native";
import { isUIFlow } from "@weekly-cal/core";
import { LoadingState, ReceiptCard, ToolUIWrapper } from "./tool-ui";
import { renderUIFlow } from "./ui-flows/registry";

function SubAgentUI({
  title,
  toolCallProps,
}: {
  title: string;
  toolCallProps: ToolCallMessagePartProps;
}) {
  const { result } = toolCallProps;

  // Native ToolUIDisplay does not provide `status` — infer from `result`
  if (result === undefined) {
    return <LoadingState title={`${title} is working`} />;
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
  activityAgent: {
    type: "backend",
    render: (props) => (
      <SubAgentUI title="Activity Agent" toolCallProps={props} />
    ),
  },
};
