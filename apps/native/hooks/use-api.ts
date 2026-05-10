import { createApiClient } from "@/lib/api";
import { useMemo } from "react";
import { useAppAuth } from "./use-auth";

export function useApi() {
  const { getToken } = useAppAuth();
  return useMemo(() => createApiClient(getToken), [getToken]);
}
