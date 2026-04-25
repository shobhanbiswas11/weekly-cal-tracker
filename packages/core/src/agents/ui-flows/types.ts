import { UpdateProfileDto } from "../../schemas";

export type UIFlow =
  | {
      type: "__uiFlow__";
      action: "UPDATE_PROFILE";
      payload: {
        changes: UpdateProfileDto;
        message: string;
      };
    }
  | {
      type: "__uiFlow__";
      action: "DELETE_PROFILE";
      payload: {
        message: string;
      };
    };

export function uiFlow<T extends UIFlow["action"]>(
  action: T,
  payload: Extract<UIFlow, { action: T }>["payload"],
): UIFlow {
  return { type: "__uiFlow__", action, payload } as UIFlow;
}

export function isUIFlow(value: unknown): value is UIFlow {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as UIFlow).type === "__uiFlow__"
  );
}
