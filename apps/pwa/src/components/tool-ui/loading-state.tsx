import { LoaderIcon } from "lucide-react";
import { ToolUIWrapper } from "./tool-wrapper";

export function LoadingState({ title }: { title: string }) {
  return (
    <ToolUIWrapper>
      <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
        <LoaderIcon className="size-4 animate-spin text-primary" />
        <span>{title}...</span>
      </div>
    </ToolUIWrapper>
  );
}
