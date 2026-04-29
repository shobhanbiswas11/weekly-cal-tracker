import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { type UIFlow } from "@weekly-cal/core";
import type { ReactNode } from "react";
import { LogMeal } from "./tool-renders/log-meal";
import { UpdateProfile } from "./tool-renders/update-profile";

export type UIFlowRendererProps<T extends UIFlow["action"]> = {
  flow: Extract<UIFlow, { action: T }>;
} & ToolCallMessagePartProps;

export type UIFlowRenderer<T extends UIFlow["action"]> = (
  props: UIFlowRendererProps<T>,
) => ReactNode;

const flowRendererRegistry: {
  [K in UIFlow["action"]]?: UIFlowRenderer<K>;
} = {
  UPDATE_PROFILE: (props) => <UpdateProfile {...props} />,
  LOG_MEAL: (props) => <LogMeal {...props} />,
};

export function renderUIFlow(
  flow: UIFlow,
  props: ToolCallMessagePartProps,
): ReactNode {
  const renderer = flowRendererRegistry[flow.action] as any;
  if (!renderer) return null;

  return renderer({
    flow,
    ...props,
  });
}
