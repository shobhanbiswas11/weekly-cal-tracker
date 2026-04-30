import type { ReactNode } from "react";

interface FlowSectionProps {
  label: string;
  children: ReactNode;
}

/**
 * Common section component for UI flows with a label and content.
 * Includes a divider before the section.
 */
export function FlowSection({ label, children }: FlowSectionProps) {
  return (
    <>
      <div className="h-px bg-border" />
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {children}
      </div>
    </>
  );
}
