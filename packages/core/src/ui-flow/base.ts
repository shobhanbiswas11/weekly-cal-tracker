/** Initiated state - flow has started, may have payload */
export type UIFlowInitiated = {
  type: "__uiFlow__";
  state: "initiated";
  action: string;
  payload?: unknown;
};

/** Completed state - flow finished successfully */
export type UIFlowCompleted = {
  type: "__uiFlow__";
  state: "completed";
  action: string;
  message?: string;
};

/** Cancelled state - flow was cancelled (by user, auto, or error) */
export type UIFlowCancelled = {
  type: "__uiFlow__";
  state: "cancelled";
  action: string;
  message?: string;
};

/** Full UIFlow union - all three states */
export type UIFlow = UIFlowInitiated | UIFlowCompleted | UIFlowCancelled;

// Type Guards
export function isUIFlow(flow: unknown): flow is UIFlow {
  return (
    typeof flow === "object" &&
    flow !== null &&
    "type" in flow &&
    flow.type === "__uiFlow__"
  );
}
export function isInitiatedUIFlow(flow: UIFlow): flow is UIFlowInitiated {
  return flow.state === "initiated";
}
export function isCompletedUIFlow(flow: UIFlow): flow is UIFlowCompleted {
  return flow.state === "completed";
}
export function isCancelledUIFlow(flow: UIFlow): flow is UIFlowCancelled {
  return flow.state === "cancelled";
}
export function isCompleteOrCancelledUIFlow(
  flow: UIFlow,
): flow is UIFlowCompleted | UIFlowCancelled {
  return flow.state === "completed" || flow.state === "cancelled";
}

// Factories
export function uiFlowInit({
  action,
  payload,
}: {
  action: string;
  payload?: unknown;
}): UIFlowInitiated {
  return {
    type: "__uiFlow__",
    state: "initiated",
    action,
    payload,
  };
}
export function uiFlowComplete({
  action,
  message,
}: {
  action: string;
  message?: string;
}): UIFlowCompleted {
  return {
    type: "__uiFlow__",
    state: "completed",
    action,
    message,
  };
}
export function uiFlowCancel({
  action,
  message,
}: {
  action: string;
  message?: string;
}): UIFlowCancelled {
  return {
    type: "__uiFlow__",
    state: "cancelled",
    action,
    message,
  };
}
