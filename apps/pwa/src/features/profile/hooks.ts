import { useDashboard } from "@/hooks/dashboard";
import { useMemo } from "react";
import type { Profile } from "./schemas";

export function useIsProfileSetupDone() {
  const { data } = useDashboard();

  return useMemo(() => {
    return !!data?.profile;
  }, [data]);
}

export function useProfile() {
  const { data } = useDashboard();

  return useMemo(() => {
    return (data?.profile ?? null) as Profile | null;
  }, [data]);
}
