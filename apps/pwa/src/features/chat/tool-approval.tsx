import type { UIMessage } from "ai";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

/**
 * Tool part states from AI SDK
 * @see https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage#tool-execution-approval
 */
export type ToolPartState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "output-available"
  | "output-denied"
  | "output-error";

/**
 * Type for tool approval helpers
 */
export type ToolApprovalHelpersType = {
  addToolApprovalResponse: (opts: {
    id: string;
    approved: boolean;
    reason?: string;
  }) => void | PromiseLike<void>;
  messages: UIMessage[];
};

const ToolApprovalContext = createContext<ToolApprovalHelpersType | null>(null);

/**
 * Hook to access tool approval helpers
 */
export function useToolApprovalHelpers(): ToolApprovalHelpersType {
  const helpers = useContext(ToolApprovalContext);
  if (!helpers) {
    throw new Error(
      "useToolApprovalHelpers must be used within ToolApprovalProvider",
    );
  }
  return helpers;
}

/**
 * Hook to send a tool approval response for server-side tools with needsApproval: true
 */
export function useToolApproval() {
  const helpers = useToolApprovalHelpers();

  const sendApprovalResponse = useCallback(
    async ({
      id,
      approved,
      reason,
    }: {
      id: string;
      approved: boolean;
      reason?: string;
    }) => {
      await helpers.addToolApprovalResponse({ id, approved, reason });
    },
    [helpers],
  );

  /**
   * Get the tool part state from raw AI SDK messages
   * @param toolCallId - The tool call ID to look up
   * @returns The tool state and approval info, or null if not found
   */
  const getToolState = useCallback(
    (
      toolCallId: string,
    ): {
      state: ToolPartState;
      approvalId?: string;
      output?: unknown;
      errorText?: string;
    } | null => {
      for (const message of helpers.messages) {
        if (message.role !== "assistant") continue;

        for (const part of message.parts) {
          // Check if this is a tool part (starts with 'tool-' or is 'dynamic-tool')
          if (!part.type.startsWith("tool-") && part.type !== "dynamic-tool") {
            continue;
          }

          // Type assertion since we know this is a tool part
          const toolPart = part as {
            type: string;
            toolCallId: string;
            state: ToolPartState;
            approval?: { id: string };
            output?: unknown;
            errorText?: string;
          };

          if (toolPart.toolCallId === toolCallId) {
            return {
              state: toolPart.state,
              approvalId: toolPart.approval?.id,
              output: toolPart.output,
              errorText: toolPart.errorText,
            };
          }
        }
      }
      return null;
    },
    [helpers.messages],
  );

  return useMemo(
    () => ({
      sendApprovalResponse,
      getToolState,
    }),
    [sendApprovalResponse, getToolState],
  );
}

/**
 * Hook to get the approval state for a specific tool call
 * @param toolCallId - The tool call ID from assistant-ui's tool part
 * @returns Tool state info from AI SDK, or null if not found
 */
export function useToolApprovalState(toolCallId: string) {
  const { getToolState } = useToolApproval();
  return useMemo(() => getToolState(toolCallId), [getToolState, toolCallId]);
}

interface ToolApprovalProviderProps {
  children: ReactNode;
  addToolApprovalResponse: ToolApprovalHelpersType["addToolApprovalResponse"];
  messages: UIMessage[];
}

/**
 * Provider for tool approval context
 */
export function ToolApprovalProvider({
  children,
  addToolApprovalResponse,
  messages,
}: ToolApprovalProviderProps) {
  const value = useMemo(
    () => ({ addToolApprovalResponse, messages }),
    [addToolApprovalResponse, messages],
  );

  return (
    <ToolApprovalContext.Provider value={value}>
      {children}
    </ToolApprovalContext.Provider>
  );
}
