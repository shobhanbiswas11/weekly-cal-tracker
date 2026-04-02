import { fetchDashboard } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const DASHBOARD_QUERY_KEY = "dashboard";

export function useInvalidateDashboard() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [DASHBOARD_QUERY_KEY] });
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY],
    queryFn: fetchDashboard,
  });
}
