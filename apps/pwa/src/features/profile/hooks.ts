import { useDashboard } from "@/hooks/dashboard";
import { useMemo } from "react";

export function useIsProfileSetupDone() {
  const { data } = useDashboard();

  return useMemo(() => {
    return !!data?.profile;
  }, [data]);
}
