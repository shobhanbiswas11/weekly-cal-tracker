import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FlowCardProps {
  icon: LucideIcon;
  iconColorClass?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/**
 * Common wrapper card for UI flow components in initiated state.
 * Provides consistent header styling with icon, title, and subtitle.
 */
export function FlowCard({
  icon: Icon,
  iconColorClass = "bg-blue-500/10 text-blue-600",
  title,
  subtitle,
  children,
}: FlowCardProps) {
  return (
    <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
      <div className="flex w-full flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconColorClass}`}
          >
            <Icon className="size-5" />
          </span>
          <div className="flex flex-1 flex-col gap-0.5">
            <h2 className="text-base font-semibold leading-tight">{title}</h2>
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>

        {children}
      </div>
    </article>
  );
}
