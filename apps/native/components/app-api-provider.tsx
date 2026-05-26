import { useCreateApiClient } from "@/hooks";
import { ApiProvider } from "@weekly-cal/frontend";

export function AppApiProvider({ children }: { children: React.ReactNode }) {
  const client = useCreateApiClient();
  return <ApiProvider client={client}>{children}</ApiProvider>;
}
