import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@clerk/react";
import { createApiClient } from "@weekly-cal/frontend";
import { useMemo } from "react";

export function useCreateApiClient() {
  const { getToken } = useAuth();
  return useMemo(
    () =>
      createApiClient({
        baseUrl: API_BASE_URL,
        getToken,
        fetch: fetch.bind(globalThis),
      }),
    [getToken],
  );
}
