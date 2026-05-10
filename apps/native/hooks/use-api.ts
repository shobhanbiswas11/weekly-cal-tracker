import { API_BASE_URL } from "@/lib/api";
import { createApiClient } from "@weekly-cal/frontend";
import { useMemo } from "react";
import { useAppAuth } from "./use-auth";

export function useCreateApiClient() {
  const { getToken } = useAppAuth();
  return useMemo(
    () =>
      createApiClient({
        baseUrl: API_BASE_URL!,
        getToken,
        fetch: globalThis.fetch,
      }),
    [getToken],
  );
}
