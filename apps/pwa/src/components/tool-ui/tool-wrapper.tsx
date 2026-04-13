import type { ReactNode } from "react";

export function ToolUIWrapper({ children }: { children: ReactNode }) {
  return <div className="my-3">{children}</div>;
}
