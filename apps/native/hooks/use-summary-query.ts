import { useQuery } from "@tanstack/react-query";
import { useApi } from "@weekly-cal/frontend";

const SUMMARY_QUERY_KEY = "summary";

export function useSummaryQuery() {
  const { fetchSummary } = useApi();
  return useQuery({
    queryKey: [SUMMARY_QUERY_KEY],
    queryFn: fetchSummary,
  });
}
