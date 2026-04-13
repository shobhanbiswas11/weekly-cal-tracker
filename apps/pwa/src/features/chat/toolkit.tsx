import { deleteEntry, updateEntry, updateProfile } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ToolDefinition } from "@assistant-ui/react";
import { toolDefinitionRegistry, type ToolName } from "@weekly-cal/core";
import {
  AlertCircle,
  Check,
  Edit,
  Loader2,
  Search,
  Trash2,
  User,
  Utensils,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import type z from "zod";
import { MealPreview } from "../calories";

// =============================================================================
// Types
// =============================================================================

type ModifyEntityInput = z.infer<
  (typeof toolDefinitionRegistry)["modify_entity"]["inputSchema"]
>;

// =============================================================================
// Helper Components
// =============================================================================

function ToolUIWrapper({ children }: { children: ReactNode }) {
  return <div className="my-3">{children}</div>;
}

function LoadingState({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
      <span>{title}...</span>
    </div>
  );
}

function ReceiptCard({
  icon,
  title,
  subtitle,
  variant = "success",
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  variant?: "success" | "error" | "cancelled";
}) {
  const variantStyles = {
    success: "text-primary",
    error: "text-destructive",
    cancelled: "text-muted-foreground",
  };

  const variantIcons = {
    success: <Check className="size-4" />,
    error: <AlertCircle className="size-4" />,
    cancelled: <X className="size-4" />,
  };

  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 shadow-sm">
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
          variantStyles[variant],
        )}
      >
        {icon ?? variantIcons[variant]}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        {subtitle && (
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Meal Preview Helpers
// =============================================================================

// =============================================================================
// Preview Meal Tool (Human tool - requires user confirmation)
// Uses type: "human" with addResult for confirmation flow
// =============================================================================

// =============================================================================
// Modify Entity Tool (Human tool - requires user confirmation)
// Uses type: "human" with addResult for confirmation flow
// =============================================================================

const modifyEntityTool = {
  type: "human" as const,
  description: toolDefinitionRegistry.modify_entity.description,
  parameters: toolDefinitionRegistry.modify_entity.inputSchema,
  render: ({
    args,
    result,
    status,
    addResult,
  }: {
    args: ModifyEntityInput;
    result?: { success: boolean; message: string };
    status: {
      readonly type: "running" | "complete" | "incomplete" | "requires-action";
      readonly reason?: string;
    };
    addResult: (result: { success: boolean; message: string }) => void;
  }) => {
    const { entity, action, id, data } = args;

    const getEntityIcon = () => {
      switch (entity) {
        case "meal":
          return <Utensils className="size-5" />;
        case "profile":
          return <User className="size-5" />;
        default:
          return <Edit className="size-5" />;
      }
    };

    const getActionIcon = () => {
      switch (action) {
        case "delete":
          return <Trash2 className="size-4" />;
        case "update":
          return <Edit className="size-4" />;
        default:
          return <Edit className="size-4" />;
      }
    };

    const getTitle = () => {
      const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
      const actionName = action.charAt(0).toUpperCase() + action.slice(1);
      return `${actionName} ${entityName}`;
    };

    const isDestructive = action === "delete";

    // Show receipt after completion
    if (result || status.type === "complete") {
      const isSuccess = result?.success ?? true;
      return (
        <ToolUIWrapper>
          <ReceiptCard
            icon={getActionIcon()}
            title={isSuccess ? getTitle() : "Cancelled"}
            subtitle={
              result?.message ??
              (isSuccess ? "Completed" : "Operation cancelled")
            }
            variant={isSuccess ? "success" : "cancelled"}
          />
        </ToolUIWrapper>
      );
    }

    // Show error state
    if (status.type === "incomplete" && status.reason === "error") {
      return (
        <ToolUIWrapper>
          <ReceiptCard
            icon={<AlertCircle className="size-4" />}
            title="Error"
            subtitle="Operation failed"
            variant="error"
          />
        </ToolUIWrapper>
      );
    }

    // Show loading during API call
    if (status.type === "running") {
      return (
        <ToolUIWrapper>
          <LoadingState title={getTitle()} />
        </ToolUIWrapper>
      );
    }

    // Handle confirm - call appropriate API
    const handleConfirm = async () => {
      try {
        if (entity === "meal") {
          if (!id) {
            addResult({ success: false, message: "Meal ID is required" });
            return;
          }
          const date = (data as { date?: string })?.date;
          if (!date) {
            addResult({
              success: false,
              message: "Date is required for meal operations",
            });
            return;
          }

          if (action === "delete") {
            await deleteEntry(date, id);
            addResult({ success: true, message: "Meal deleted successfully" });
          } else if (action === "update" && data) {
            await updateEntry(date, id, data);
            addResult({ success: true, message: "Meal updated successfully" });
          }
        } else if (entity === "profile") {
          if (action === "update" && data) {
            await updateProfile(data);
            addResult({
              success: true,
              message: "Profile updated successfully",
            });
          } else if (action === "delete") {
            addResult({
              success: false,
              message: "Profile deletion is not supported",
            });
          }
        }
      } catch (error) {
        addResult({
          success: false,
          message: error instanceof Error ? error.message : "Operation failed",
        });
      }
    };

    // Handle cancel
    const handleCancel = () => {
      addResult({ success: false, message: "User cancelled" });
    };

    // Format data for display
    const formatData = (data: Record<string, unknown> | null) => {
      if (!data) return [];
      return Object.entries(data)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => ({
          key: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          value:
            typeof value === "object" ? JSON.stringify(value) : String(value),
        }));
    };

    const metadata = formatData(data);

    // Interactive view
    return (
      <ToolUIWrapper>
        <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
          <div
            className={cn(
              "flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm",
              isDestructive && "border-destructive/30",
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-xl",
                  isDestructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-primary/10 text-primary",
                )}
              >
                {getEntityIcon()}
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <h2 className="text-base font-semibold leading-tight">
                  {getTitle()}
                </h2>
                {id && (
                  <span className="text-xs text-muted-foreground">
                    ID: {id}
                  </span>
                )}
              </div>
            </div>

            {/* Data Preview */}
            {metadata.length > 0 && (
              <>
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {action === "delete" ? "Will be deleted" : "Changes"}
                  </span>
                  <div className="space-y-1.5">
                    {metadata.map(({ key, value }) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <span className="text-muted-foreground">{key}</span>
                        <span className="text-right font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Warning for delete */}
            {isDestructive && (
              <>
                <div className="h-px bg-border" />
                <div className="flex items-start gap-2 rounded-lg bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>This action cannot be undone.</span>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors",
                  isDestructive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                {action === "delete" ? "Delete" : "Update"}
              </button>
            </div>
          </div>
        </article>
      </ToolUIWrapper>
    );
  },
};

// =============================================================================
// Backend Tool Config
// =============================================================================

const backendToolConfig: Record<
  string,
  { title: string; icon: ReactNode; loadingText: string }
> = {
  get_meal_entries_by_date: {
    title: "Entries by Date",
    icon: <Search className="size-4" />,
    loadingText: "Fetching meals for date",
  },
  get_meal_entries_by_week: {
    title: "Entries by Week",
    icon: <Search className="size-4" />,
    loadingText: "Fetching meals for week",
  },
};

// =============================================================================
// Backend Tool Render Helper
// =============================================================================

type BackendToolStatus = {
  readonly type: "running" | "complete" | "incomplete" | "requires-action";
  readonly reason?: string;
};

function createBackendToolRender(toolName: string) {
  const config = backendToolConfig[toolName] ?? {
    title: toolName,
    icon: <Search className="size-4" />,
    loadingText: `Running ${toolName}`,
  };

  return ({
    status,
    result,
  }: {
    status: BackendToolStatus;
    result?: unknown;
  }) => {
    // Loading state
    if (status.type === "running") {
      return (
        <ToolUIWrapper>
          <LoadingState title={config.loadingText} />
        </ToolUIWrapper>
      );
    }

    // Error state
    if (status.type === "incomplete") {
      return (
        <ToolUIWrapper>
          <ReceiptCard
            icon={config.icon}
            title={config.title}
            subtitle={status.reason === "error" ? "Failed" : "Incomplete"}
            variant="error"
          />
        </ToolUIWrapper>
      );
    }

    // Complete state - success receipt
    if (status.type === "complete") {
      const dataCount =
        result && typeof result === "object" && "data" in result
          ? Array.isArray((result as { data?: unknown[] }).data)
            ? (result as { data: unknown[] }).data.length
            : 1
          : 0;

      return (
        <ToolUIWrapper>
          <ReceiptCard
            icon={config.icon}
            title={config.title}
            subtitle={
              dataCount > 0 ? `Found ${dataCount} item(s)` : "No data found"
            }
            variant="success"
          />
        </ToolUIWrapper>
      );
    }

    return null;
  };
}

// =============================================================================
// Centralized Toolkit using the recommended Tools() API
// All tools are defined in one place and registered via useAui({ tools: Tools({ toolkit }) })
// =============================================================================

export const toolkit: { [key in ToolName]?: ToolDefinition<any, any> } = {
  preview_meal: {
    type: "human" as const,
    description: toolDefinitionRegistry.preview_meal.description,
    parameters: toolDefinitionRegistry.preview_meal.inputSchema,
    render: ({ addResult, args, result }) => {
      return <MealPreview addResult={addResult} input={args} result={result} />;
    },
  },
  modify_entity: {
    type: "human" as const,
    description: toolDefinitionRegistry.modify_entity.description,
    parameters: toolDefinitionRegistry.modify_entity.inputSchema,
    render: () => {},
  },
  get_meal_entries_by_date: {
    type: "backend",
    render: createBackendToolRender("get_meal_entries_by_date"),
  },
  get_meal_entries_by_week: {
    type: "backend",
    render: createBackendToolRender("get_meal_entries_by_week"),
  },
};
