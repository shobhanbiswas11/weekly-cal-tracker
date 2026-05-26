import { API_BASE_URL } from "@/lib/config";
import { createApiClient } from "@weekly-cal/frontend";
import { fetch } from "expo/fetch";
import { useMemo } from "react";
import { useAppAuth } from "./use-auth";

export function useCreateApiClient() {
  const { getToken } = useAppAuth();
  return useMemo(
    () =>
      createApiClient({
        baseUrl: API_BASE_URL!,
        getToken,
        fetch: fetch as typeof globalThis.fetch,
      }),
    [getToken],
  );
}
