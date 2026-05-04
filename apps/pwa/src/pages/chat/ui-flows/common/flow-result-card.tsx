import { CheckCircle, X } from "lucide-react";

type FlowResultState = "completed" | "cancelled";

export function FlowResultCard({
  state,
  message,
}: {
  state: FlowResultState;
  message?: string;
}) {
  const isSuccess = state === "completed";

  return (
    <article className="flex w-full max-w-md flex-col gap-3 text-foreground">
      <div className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        {isSuccess ? (
          <>
            <span className="flex size-8 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle className="size-4" />
            </span>
            <span className="text-sm font-medium text-success">
              {message ?? "Completed successfully"}
            </span>
          </>
        ) : (
          <>
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <X className="size-4" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {message ?? "Cancelled"}
            </span>
          </>
        )}
      </div>
    </article>
  );
}
