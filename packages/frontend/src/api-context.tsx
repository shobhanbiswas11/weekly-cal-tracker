import { createContext, useContext } from "react";
import type { ApiClient } from "./types";

const ApiClientContext = createContext<ApiClient | null>(null);

export function ApiProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: React.ReactNode;
}) {
  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApi(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("useApi must be used within an <ApiProvider>");
  }
  return client;
}
