import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useApi } from "../api-context";

const SUMMARY_QUERY_KEY = "summary";

export function useInvalidateSummaryQuery() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [SUMMARY_QUERY_KEY] });
  };
}

export function useSummaryQuery() {
  const { fetchSummary } = useApi();
  return useSuspenseQuery({
    queryKey: [SUMMARY_QUERY_KEY],
    queryFn: () => fetchSummary(),
  });
}
