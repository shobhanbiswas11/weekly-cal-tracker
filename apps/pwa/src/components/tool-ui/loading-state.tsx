import { Loader2 } from "lucide-react";

export function LoadingState({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 text-sm">
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
      <span>{title}...</span>
    </div>
  );
}
