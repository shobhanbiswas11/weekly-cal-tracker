import { Button } from "@/components/ui/button";

interface FlowActionButtonsProps {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  loading?: boolean;
}

/**
 * Common action buttons for UI flows with cancel/confirm options.
 */
export function FlowActionButtons({
  onCancel,
  onConfirm,
  cancelLabel = "Discard",
  confirmLabel = "Confirm",
  isDestructive = false,
  loading = false,
}: FlowActionButtonsProps) {
  return (
    <div className="flex justify-end gap-2 pt-1">
      <Button variant="ghost" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={isDestructive ? "destructive" : "default"}
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
