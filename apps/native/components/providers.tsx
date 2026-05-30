import { useUser } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppApiProvider } from "./app-api-provider";
import { ClerkProvider } from "./clerk-provider";
import { RevenueCatProvider } from "./revenuecat-provider";

const queryClient = new QueryClient();

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  return (
    <RevenueCatProvider userId={user?.id ?? null}>
      <QueryClientProvider client={queryClient}>
        <AppApiProvider>
          <KeyboardProvider>
            <SafeAreaProvider>{children}</SafeAreaProvider>
          </KeyboardProvider>
        </AppApiProvider>
      </QueryClientProvider>
    </RevenueCatProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <InnerProviders>{children}</InnerProviders>
    </ClerkProvider>
  );
}
