import { cn } from "@/lib/utils";
import { AlertCircle, Check, X } from "lucide-react";
import type { ReactNode } from "react";

export function ReceiptCard({
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
