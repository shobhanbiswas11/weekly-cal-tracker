import { useAppAuth } from "@/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppApiProvider } from "./app-api-provider";
import { ClerkProvider } from "./clerk-provider";
import { SubscriptionProvider } from "./subscription-provider";

const queryClient = new QueryClient();

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { userId } = useAppAuth();

  return (
    <SubscriptionProvider userId={userId}>
      <QueryClientProvider client={queryClient}>
        <AppApiProvider>
          <KeyboardProvider>
            <SafeAreaProvider>{children}</SafeAreaProvider>
          </KeyboardProvider>
        </AppApiProvider>
      </QueryClientProvider>
    </SubscriptionProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <InnerProviders>{children}</InnerProviders>
    </ClerkProvider>
  );
}
