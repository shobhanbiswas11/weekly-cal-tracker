import { LoadingState } from "@/components/tool-ui/loading-state";
import { ReceiptCard } from "@/components/tool-ui/receipt-card";
import { ToolUIWrapper } from "@/components/tool-ui/tool-wrapper";
import { deleteEntry, updateEntry, updateProfile } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toolDefinitionRegistry } from "@weekly-cal/core";
import { AlertCircle, Edit, Trash2, User, Utensils } from "lucide-react";
import type z from "zod";

type ModifyEntityInput = z.infer<
  (typeof toolDefinitionRegistry)["modify_entity"]["inputSchema"]
>;

type ToolStatus = {
  readonly type: "running" | "complete" | "incomplete" | "requires-action";
  readonly reason?: string;
};

interface RenderProps {
  args: Partial<ModifyEntityInput>;
  result?: { success: boolean; message: string };
  status: ToolStatus;
  addResult: (result: { success: boolean; message: string }) => void;
}

// Helper functions that safely handle potentially undefined args
const getEntityIcon = (entity?: string) => {
  switch (entity) {
    case "meal":
      return <Utensils className="size-5" />;
    case "profile":
      return <User className="size-5" />;
    default:
      return <Edit className="size-5" />;
  }
};

const getActionIcon = (action?: string) => {
  switch (action) {
    case "delete":
      return <Trash2 className="size-4" />;
    case "update":
      return <Edit className="size-4" />;
    default:
      return <Edit className="size-4" />;
  }
};

const getTitle = (entity?: string, action?: string) => {
  if (!entity || !action) return "Modifying...";
  const entityName = entity.charAt(0).toUpperCase() + entity.slice(1);
  const actionName = action.charAt(0).toUpperCase() + action.slice(1);
  return `${actionName} ${entityName}`;
};

const formatData = (data: Record<string, unknown> | null | undefined) => {
  if (!data) return [];
  return Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
    }));
};

export function renderModifyEntity({
  args,
  result,
  status,
  addResult,
}: RenderProps) {
  // Args stream in during "running" - show loading
  if (status.type === "running") {
    return (
      <ToolUIWrapper>
        <LoadingState title={getTitle(args?.entity, args?.action)} />
      </ToolUIWrapper>
    );
  }

  // Show receipt after completion
  if (result || status.type === "complete") {
    const isSuccess = result?.success ?? true;
    return (
      <ToolUIWrapper>
        <ReceiptCard
          icon={getActionIcon(args?.action)}
          title={isSuccess ? getTitle(args?.entity, args?.action) : "Cancelled"}
          subtitle={
            result?.message ?? (isSuccess ? "Completed" : "Operation cancelled")
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

  // At this point status is "requires-action", args should be complete
  const { entity, action, id, data } = args as ModifyEntityInput;
  const isDestructive = action === "delete";
  const metadata = formatData(data);

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

  // Interactive view - requires-action state
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
              {getEntityIcon(entity)}
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <h2 className="text-base font-semibold leading-tight">
                {getTitle(entity, action)}
              </h2>
              {id && (
                <span className="text-xs text-muted-foreground">ID: {id}</span>
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
}
