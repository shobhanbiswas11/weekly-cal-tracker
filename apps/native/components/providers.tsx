import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppApiProvider } from "./app-api-provider";
import { ClerkProvider } from "./clerk-provider";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <AppApiProvider>
          <KeyboardProvider>
            <SafeAreaProvider>{children}</SafeAreaProvider>
          </KeyboardProvider>
        </AppApiProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
