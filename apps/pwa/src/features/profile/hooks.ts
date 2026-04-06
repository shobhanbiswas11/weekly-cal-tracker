import { useDashboard } from "@/hooks/dashboard";
import { useMemo } from "react";
import type { Profile } from "./types";

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
