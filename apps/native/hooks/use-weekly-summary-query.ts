import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentWeekId } from "@weekly-cal/core";
import { useApi } from "@weekly-cal/frontend";

export function useWeeklySummaryQuery(weekId?: string) {
  const { fetchSummary } = useApi();
  const resolvedWeekId = weekId ?? getCurrentWeekId();
  return useQuery({
    queryKey: ["summary", resolvedWeekId],
    queryFn: () => fetchSummary(weekId),
    staleTime: Infinity,
  });
}

export function useInvalidateWeeklySummaryQuery() {
  const queryClient = useQueryClient();
  return (weekId?: string) =>
    queryClient.invalidateQueries({
      queryKey: ["summary", weekId ?? getCurrentWeekId()],
    });
}
