import { isUIFlow } from "@weekly-cal/core";
import { StopCondition } from "ai";

/**
 * Creates a stop condition that halts the agent loop when any tool result
 * contains a UI flow payload.
 */
export function hasUIFlowResult(): StopCondition<any> {
  return ({ steps }) => {
    return steps.some((step) =>
      step.toolResults?.some((result) => isUIFlow(result.output)),
    );
  };
}
