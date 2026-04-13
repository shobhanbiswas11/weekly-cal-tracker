import { LoadingState } from "@/components/tool-ui/loading-state";
import { ReceiptCard } from "@/components/tool-ui/receipt-card";
import { ToolUIWrapper } from "@/components/tool-ui/tool-wrapper";
import { Search } from "lucide-react";

type ToolStatus = {
  readonly type: "running" | "complete" | "incomplete" | "requires-action";
  readonly reason?: string;
};

interface RenderProps {
  status: ToolStatus;
  result?: unknown;
}

export function renderGetMealEntriesByWeek({ status, result }: RenderProps) {
  // Running state
  if (status.type === "running") {
    return (
      <ToolUIWrapper>
        <LoadingState title="Fetching meals for week" />
      </ToolUIWrapper>
    );
  }

  // Error state
  if (status.type === "incomplete") {
    return (
      <ToolUIWrapper>
        <ReceiptCard
          icon={<Search className="size-4" />}
          title="Entries by Week"
          subtitle={
            status.reason === "error" ? "Failed to fetch" : "Incomplete"
          }
          variant="error"
        />
      </ToolUIWrapper>
    );
  }

  // Success state
  if (status.type === "complete") {
    const dataCount =
      result && typeof result === "object" && "data" in result
        ? Array.isArray((result as { data?: unknown[] }).data)
          ? (result as { data: unknown[] }).data.length
          : 1
        : 0;

    return (
      <ToolUIWrapper>
        <ReceiptCard
          icon={<Search className="size-4" />}
          title="Entries by Week"
          subtitle={
            dataCount > 0 ? `Found ${dataCount} meal(s)` : "No meals found"
          }
          variant="success"
        />
      </ToolUIWrapper>
    );
  }

  return null;
}
