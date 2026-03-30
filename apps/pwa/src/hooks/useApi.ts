import { api } from "@/lib/api";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";

export function useApi() {
  const { getToken } = useAuth();

  useEffect(() => {
    api.setTokenGetter(getToken);
  }, [getToken]);

  return api;
}
