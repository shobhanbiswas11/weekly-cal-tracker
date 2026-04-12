import { cn } from "@/lib/utils";
import type { ToolCallMessagePartComponent } from "@assistant-ui/react";
import { type Toolkit } from "@assistant-ui/react";
import {
  toolDefinitionRegistry,
  type ToolDefinition as CoreToolDefinition,
  type ToolName,
} from "@weekly-cal/core";
import {
  AlertCircle,
  Check,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  User,
  Utensils,
  X,
} from "lucide-react";
import { useToolApproval, useToolApprovalState } from "./tool-approval";

// =============================================================================
// Approval Card Component (inline)
// =============================================================================

type ApprovalStatus = "pending" | "approved" | "denied";

interface ToolApprovalCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  confirmLabel?: string;
  cancelLabel?: string;
  status: ApprovalStatus;
  onConfirm: () => void;
  onCancel: () => void;
  metadata?: Array<{ key: string; value: string }>;
}

function ToolApprovalCard({
  id,
  title,
  description,
  icon,
  variant = "default",
  confirmLabel = "Approve",
  cancelLabel = "Deny",
  status,
  onConfirm,
  onCancel,
  metadata,
}: ToolApprovalCardProps) {
  const isDestructive = variant === "destructive";

  // Receipt view for approved/denied
  if (status !== "pending") {
    const isApproved = status === "approved";
    return (
      <div
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 shadow-sm"
        data-tool-ui-id={id}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
            isApproved ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isApproved ? <Check className="size-4" /> : <X className="size-4" />}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isApproved ? "Approved" : "Denied"}
          </span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
      </div>
    );
  }

  // Interactive approval view
  return (
    <article
      className="flex w-full max-w-md flex-col gap-3 text-foreground"
      data-tool-ui-id={id}
    >
      <div className="flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          {icon && (
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                isDestructive
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              {icon}
            </span>
          )}
          <div className="flex flex-1 flex-col gap-1">
            <h2 className="text-base font-semibold leading-tight">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {metadata && metadata.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <dl className="flex flex-col gap-2 text-sm">
              {metadata.map((item, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">{item.key}</dt>
                  <dd className="min-w-0 truncate">{item.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-primary-foreground transition-colors",
              isDestructive
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

// =============================================================================
// Log Meal Card Component (custom UI for log_meal)
// =============================================================================

interface FoodItem {
  emoji: string;
  name: string;
  quantity: string;
  calories?: number;
}

interface LogMealArgs {
  name?: string;
  description?: string;
  foods?: FoodItem[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  date?: string;
}

interface LogMealCardProps {
  id: string;
  args: LogMealArgs;
  status: ApprovalStatus;
  onConfirm: () => void;
  onCancel: () => void;
}

function LogMealCard({
  id,
  args,
  status,
  onConfirm,
  onCancel,
}: LogMealCardProps) {
  const { name, foods, calories, protein, carbs, fats, date } = args;

  // Receipt view for approved/denied
  if (status !== "pending") {
    const isApproved = status === "approved";
    return (
      <div
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 shadow-sm"
        data-tool-ui-id={id}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-muted",
            isApproved ? "text-primary" : "text-muted-foreground",
          )}
        >
          {isApproved ? <Check className="size-4" /> : <X className="size-4" />}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isApproved ? "Logged" : "Cancelled"}
          </span>
          <span className="text-sm text-muted-foreground">
            {name || "Meal"}
          </span>
        </div>
      </div>
    );
  }

  // Interactive approval view with food items
  return (
    <article
      className="flex w-full max-w-md flex-col gap-3 text-foreground"
      data-tool-ui-id={id}
    >
      <div className="flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Utensils className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-base font-semibold leading-tight">
              {name || "Log Meal"}
            </h2>
            {date && (
              <span className="text-xs text-muted-foreground">{date}</span>
            )}
          </div>
        </div>

        {/* Food Items Grid */}
        {foods && foods.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="grid gap-2">
              {foods.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2"
                >
                  <span className="text-xl">{food.emoji}</span>
                  <div className="flex flex-1 flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {food.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {food.quantity}
                    </span>
                  </div>
                  {food.calories && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {food.calories} kcal
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Macro Summary */}
        <div className="h-px bg-border" />
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-primary">
              {calories ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{protein ?? 0}g</span>
            <span className="text-xs text-muted-foreground">protein</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{carbs ?? 0}g</span>
            <span className="text-xs text-muted-foreground">carbs</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">{fats ?? 0}g</span>
            <span className="text-xs text-muted-foreground">fat</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Log
          </button>
        </div>
      </div>
    </article>
  );
}

// =============================================================================
// Simple Tool Fallback (inline - for non-approval tools)
// =============================================================================

interface SimpleToolFallbackProps {
  title: string;
  argsText?: string;
  result?: unknown;
  isComplete?: boolean;
}

function SimpleToolFallback({ title, isComplete }: SimpleToolFallbackProps) {
  if (!isComplete) {
    return (
      <span className="text-sm text-muted-foreground">
        Tool called: {title}
      </span>
    );
  }

  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-2xl border bg-card/60 px-4 py-3 shadow-sm">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="size-4" />
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Completed</span>
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
    </div>
  );
}

// =============================================================================
// Tool UI Wrapper (adds spacing)
// =============================================================================

function ToolUIWrapper({ children }: { children: React.ReactNode }) {
  return <div className="my-3">{children}</div>;
}

// =============================================================================
// Tool Icon Mapping
// =============================================================================

const toolIcons: Record<ToolName, React.ReactNode> = {
  // Meal Entry Tools
  log_meal: <Utensils className="size-5" />,
  update_meal_entry: <Edit className="size-5" />,
  delete_meal_entry: <Trash2 className="size-5" />,
  get_meal_entry: <Search className="size-5" />,
  entries_by_calendar_week: <Search className="size-5" />,
  entries_by_date: <Search className="size-5" />,
  // Profile Tools
  create_profile: <Plus className="size-5" />,
  update_profile: <Edit className="size-5" />,
  get_profile: <User className="size-5" />,
  delete_profile: <Trash2 className="size-5" />,
};

// =============================================================================
// Get variant based on tool name
// =============================================================================

function getToolVariant(toolName: ToolName): "default" | "destructive" {
  if (toolName.startsWith("delete_")) return "destructive";
  return "default";
}

// =============================================================================
// Format args as metadata for approval card
// =============================================================================

function formatArgsAsMetadata(
  args: Record<string, unknown>,
): Array<{ key: string; value: string }> {
  return Object.entries(args)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => ({
      key: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
    }));
}

// =============================================================================
// Make Tool Render Component
// =============================================================================

type ToolRenderOverride = Partial<
  Record<ToolName, ToolCallMessagePartComponent>
>;

// Custom render overrides for specific tools (add your customizations here)
const toolRenderOverrides: ToolRenderOverride = {
  log_meal: function LogMealRender({ toolCallId, args }) {
    const { sendApprovalResponse } = useToolApproval();
    const aiSdkState = useToolApprovalState(toolCallId);

    if (!aiSdkState) {
      return (
        <ToolUIWrapper>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span>
              Preparing <span className="font-medium">Log Meal</span>...
            </span>
          </div>
        </ToolUIWrapper>
      );
    }

    const { state, approvalId } = aiSdkState;

    // Approval requested
    if (state === "approval-requested" && approvalId) {
      const handleConfirm = () => {
        sendApprovalResponse({ id: approvalId, approved: true });
      };
      const handleCancel = () => {
        sendApprovalResponse({
          id: approvalId,
          approved: false,
          reason:
            "[USER_DECLINED] The user declined to log this meal. Acknowledge and ask if they need anything else.",
        });
      };

      return (
        <ToolUIWrapper>
          <LogMealCard
            id={approvalId}
            args={args as LogMealArgs}
            status="pending"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </ToolUIWrapper>
      );
    }

    // Approved
    if (state === "output-available") {
      return (
        <ToolUIWrapper>
          <LogMealCard
            id={toolCallId}
            args={args as LogMealArgs}
            status="approved"
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </ToolUIWrapper>
      );
    }

    // Denied
    if (state === "output-denied") {
      return (
        <ToolUIWrapper>
          <LogMealCard
            id={toolCallId}
            args={args as LogMealArgs}
            status="denied"
            onConfirm={() => {}}
            onCancel={() => {}}
          />
        </ToolUIWrapper>
      );
    }

    // Loading state
    return (
      <ToolUIWrapper>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
          <span>
            Preparing <span className="font-medium">Log Meal</span>...
          </span>
        </div>
      </ToolUIWrapper>
    );
  },
};

function makeDefaultToolRender(
  toolName: ToolName,
  toolDef: CoreToolDefinition,
): ToolCallMessagePartComponent {
  return function ToolRender({
    toolName: name,
    toolCallId,
    argsText,
    args,
    result,
    status,
  }) {
    const { sendApprovalResponse } = useToolApproval();
    // Get the actual AI SDK state for this tool call
    const aiSdkState = useToolApprovalState(toolCallId);

    // For approval tools, use the AI SDK state for accurate status
    if (toolDef.approval?.require && aiSdkState) {
      const { state, approvalId } = aiSdkState;

      // Waiting for user approval
      if (state === "approval-requested" && approvalId) {
        const handleConfirm = () => {
          sendApprovalResponse({ id: approvalId, approved: true });
        };

        const handleCancel = () => {
          sendApprovalResponse({
            id: approvalId,
            approved: false,
            reason: `[USER_DECLINED] The user intentionally declined to ${toolDef.title.toLowerCase()}. This is NOT an error. Acknowledge their choice and ask if they need anything else.`,
          });
        };

        return (
          <ToolUIWrapper>
            <ToolApprovalCard
              id={approvalId}
              title={toolDef.title}
              description={toolDef.description}
              icon={toolIcons[toolName]}
              variant={getToolVariant(toolName)}
              confirmLabel={toolDef.approval?.confirmLabel}
              cancelLabel={toolDef.approval?.cancelLabel}
              status="pending"
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              metadata={
                args
                  ? formatArgsAsMetadata(args as Record<string, unknown>)
                  : undefined
              }
            />
          </ToolUIWrapper>
        );
      }

      // Tool executed successfully (user approved)
      if (state === "output-available") {
        return (
          <ToolUIWrapper>
            <ToolApprovalCard
              id={name}
              title={toolDef.title}
              icon={toolIcons[toolName]}
              status="approved"
              onConfirm={() => {}}
              onCancel={() => {}}
            />
          </ToolUIWrapper>
        );
      }

      // Tool was denied by user
      if (state === "output-denied") {
        return (
          <ToolUIWrapper>
            <ToolApprovalCard
              id={name}
              title={toolDef.title}
              icon={toolIcons[toolName]}
              status="denied"
              onConfirm={() => {}}
              onCancel={() => {}}
            />
          </ToolUIWrapper>
        );
      }

      // Tool errored
      if (state === "output-error") {
        return (
          <ToolUIWrapper>
            <ToolApprovalCard
              id={name}
              title={toolDef.title}
              icon={toolIcons[toolName]}
              status="denied"
              onConfirm={() => {}}
              onCancel={() => {}}
            />
          </ToolUIWrapper>
        );
      }

      // Input streaming or available (waiting for execute)
      if (state === "input-streaming" || state === "input-available") {
        return (
          <ToolUIWrapper>
            <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span>
                Preparing <span className="font-medium">{toolDef.title}</span>
                ...
              </span>
            </div>
          </ToolUIWrapper>
        );
      }
    }

    // Fallback to assistant-ui status for non-approval tools or when AI SDK state is not available

    // Running state
    if (status?.type === "running") {
      return (
        <ToolUIWrapper>
          <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span>
              Running <span className="font-medium">{toolDef.title}</span>...
            </span>
          </div>
        </ToolUIWrapper>
      );
    }

    // Incomplete/error state (for non-approval tools or fallback)
    if (status?.type === "incomplete") {
      return (
        <ToolUIWrapper>
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            <AlertCircle className="size-4 text-destructive" />
            <span className="text-destructive">{toolDef.title} failed</span>
          </div>
        </ToolUIWrapper>
      );
    }

    // Complete state - show fallback for non-approval tools
    if (status?.type === "complete") {
      return (
        <ToolUIWrapper>
          <SimpleToolFallback
            title={toolDef.title}
            argsText={argsText}
            result={result}
            isComplete
          />
        </ToolUIWrapper>
      );
    }

    // Default fallback
    return (
      <ToolUIWrapper>
        <SimpleToolFallback
          title={toolDef.title}
          argsText={argsText}
          result={result}
        />
      </ToolUIWrapper>
    );
  };
}

// =============================================================================
// Build Toolkit from Registry
// =============================================================================

function buildToolkit(): Toolkit {
  const toolkit: Toolkit = {};

  for (const [name, toolDef] of Object.entries(toolDefinitionRegistry)) {
    const toolName = name as ToolName;
    const def = toolDef as CoreToolDefinition;

    toolkit[name] = {
      type: "backend",
      render:
        toolRenderOverrides[toolName] ?? makeDefaultToolRender(toolName, def),
    };
  }

  return toolkit;
}

export const toolkit = buildToolkit();
