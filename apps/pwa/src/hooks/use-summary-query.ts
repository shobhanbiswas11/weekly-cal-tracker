import { fetchSummary } from "@/lib/api";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

const SUMMARY_QUERY_KEY = "summary";

export function useInvalidateSummaryQuery() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [SUMMARY_QUERY_KEY] });
  };
}

export function useSummaryQuery() {
  return useSuspenseQuery({
    queryKey: [SUMMARY_QUERY_KEY],
    queryFn: fetchSummary,
  });
}
