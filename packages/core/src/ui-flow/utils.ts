import { uiFlowCancel, uiFlowComplete, uiFlowInit } from "./base";

export function defaultFlowBuilder<T extends unknown>(action: string) {
  return {
    init: (payload: T) =>
      uiFlowInit({
        action,
        payload,
      }),
    complete: (message = `${action} completed`) =>
      uiFlowComplete({
        action,
        message,
      }),
    cancel: (message = `${action} cancelled`) =>
      uiFlowCancel({
        action,
        message,
      }),

    getInitPayload(flow: ReturnType<typeof uiFlowInit>): T {
      if (flow.action !== action) {
        throw new Error(`Invalid UIFlow: Expected action ${action}`);
      }
      if (flow.state !== "initiated") {
        throw new Error(
          `Invalid UIFlow: Expected initiated state for ${action}`,
        );
      }
      return flow.payload as T;
    },
  };
}
