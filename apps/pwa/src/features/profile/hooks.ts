import { useSummaryQuery } from "@/hooks/use-summary-query";
import { useMemo } from "react";
import type { Profile } from "./types";

export function useIsProfileSetupDone() {
  const { data } = useSummaryQuery();

  return useMemo(() => {
    return !!data?.profile;
  }, [data]);
}

export function useProfile() {
  const { data } = useSummaryQuery();

  return useMemo(() => {
    return (data?.profile ?? null) as Profile | null;
  }, [data]);
}
