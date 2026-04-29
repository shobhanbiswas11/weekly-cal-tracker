import { useAui, useAuiEvent } from "@assistant-ui/react";
import { isUIFlow, uiFlowAutoCancel, type UIFlow } from "@weekly-cal/core";

/**
 * Hook that auto-cancels any initiated UI flows when the user sends a new message.
 * This prevents stale confirmation dialogs from remaining active when the user
 * moves on to a different request.
 */
export function useAutoCancelInitiatedFlows() {
  const aui = useAui();

  useAuiEvent("composer.send", () => {
    const { messages } = aui.thread().getState();

    // Find the last message with initiated UI flows
    for (let msgIdx = messages.length - 1; msgIdx >= 0; msgIdx--) {
      const message = messages[msgIdx];
      if (message.role !== "assistant") continue;

      const parts = message.parts ?? [];
      for (let partIdx = 0; partIdx < parts.length; partIdx++) {
        const part = parts[partIdx];
        if (part.type !== "tool-call") continue;

        const result = part.result;
        if (!isUIFlow(result)) continue;

        const flow = result as UIFlow & { payload?: { state?: string } };
        if (flow.payload?.state !== "initiated") continue;

        // Found an initiated flow - cancel it
        const partApi = aui
          .thread()
          .message({ index: msgIdx })
          .part({ index: partIdx });

        partApi.addToolResult(
          uiFlowAutoCancel("Auto Cancelled due to new user message"),
        );
      }
    }
  });
}
