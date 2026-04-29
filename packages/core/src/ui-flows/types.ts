import { LogMealPayload, UpdateProfilePayload } from "./payloads";

// ============================================================================
// UI Flow Registry - Single source of truth
// ============================================================================
// Add new flows here. Use `never` for flows without payload.
// The UIFlow union type is automatically derived from this registry.

export interface UIFlowAutoCancel {
  type: "__uiFlowAutoCancel__";
  message?: string;
}

export interface UIFlowRegistry {
  UPDATE_PROFILE: UpdateProfilePayload;
  DELETE_PROFILE: never;
  LOG_MEAL: LogMealPayload;
}

// ============================================================================
// Derived Types - Do not modify
// ============================================================================

/** All valid UI flow action names */
export type UIFlowAction = keyof UIFlowRegistry;

/** Union of all UI flow types - auto-generated from registry */
export type UIFlow = {
  [K in UIFlowAction]: UIFlowRegistry[K] extends never
    ? { type: "__uiFlow__"; action: K }
    : { type: "__uiFlow__"; action: K; payload: UIFlowRegistry[K] };
}[UIFlowAction];

/** Extract a specific UI flow by action name */
export type UIFlowByAction<T extends UIFlowAction> = Extract<
  UIFlow,
  { action: T }
>;

/** Extract payload type for a specific action */
export type UIFlowPayload<T extends UIFlowAction> =
  UIFlowRegistry[T] extends never ? undefined : UIFlowRegistry[T];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Type-safe factory for creating UI flow objects.
 * Payload is required only for actions that have a payload defined.
 */
export function uiFlow<T extends UIFlowAction>(
  action: T,
  ...args: UIFlowRegistry[T] extends never ? [] : [payload: UIFlowRegistry[T]]
): UIFlowByAction<T> {
  const [payload] = args;
  return (
    payload !== undefined
      ? { type: "__uiFlow__", action, payload }
      : { type: "__uiFlow__", action }
  ) as UIFlowByAction<T>;
}

export function uiFlowAutoCancel(message?: string): UIFlowAutoCancel {
  return {
    type: "__uiFlowAutoCancel__",
    message,
  };
}

/** Type guard to check if a value is a UI flow */
export function isUIFlow(value: unknown): value is UIFlow {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as UIFlow).type === "__uiFlow__"
  );
}

export function isUIFlowAutoCancel(value: unknown): value is UIFlowAutoCancel {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as UIFlowAutoCancel).type === "__uiFlowAutoCancel__"
  );
}

/** Type guard to check if a UI flow is a specific action */
export function isUIFlowAction<T extends UIFlowAction>(
  value: UIFlow,
  action: T,
): value is UIFlowByAction<T> {
  return value.action === action;
}
