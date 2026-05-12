import type { ToolCallMessagePartProps } from "@assistant-ui/react-native";
import type { UIFlow } from "@weekly-cal/core";

export type UIFlowRendererProps = {
  flow: UIFlow;
} & ToolCallMessagePartProps;
