import { useSuspenseQuery } from "@tanstack/react-query";
import { useApi } from "../api-context";

export function useEntriesByDateQuery(date: string) {
  const { fetchEntriesByDate } = useApi();
  return useSuspenseQuery({
    queryKey: ["entries", date],
    queryFn: () => fetchEntriesByDate(date),
  });
}
