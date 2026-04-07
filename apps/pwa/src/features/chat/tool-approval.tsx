import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Type for tool approval helpers
 */
export type ToolApprovalHelpersType = {
  addToolApprovalResponse: (opts: {
    id: string;
    approved: boolean;
    reason?: string;
  }) => void | PromiseLike<void>;
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

  return useMemo(
    () => ({
      /**
       * Send an approval response for a tool call
       * @param id - The approval request ID from interrupt.payload.id
       * @param approved - Whether to approve or deny the tool execution
       * @param reason - Optional reason for the decision
       */
      sendApprovalResponse: async ({
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
    }),
    [helpers],
  );
}

interface ToolApprovalProviderProps {
  children: ReactNode;
  addToolApprovalResponse: ToolApprovalHelpersType["addToolApprovalResponse"];
}

/**
 * Provider for tool approval context
 */
export function ToolApprovalProvider({
  children,
  addToolApprovalResponse,
}: ToolApprovalProviderProps) {
  const value = useMemo(
    () => ({ addToolApprovalResponse }),
    [addToolApprovalResponse],
  );

  return (
    <ToolApprovalContext.Provider value={value}>
      {children}
    </ToolApprovalContext.Provider>
  );
}
