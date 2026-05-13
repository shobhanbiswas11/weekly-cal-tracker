import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiProvider } from "@weekly-cal/frontend";
import { Stack } from "expo-router";
import { View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ChatFAB } from "../components";
import { ClerkProvider } from "../components/clerk-provider";
import "../global.css";
import { useCreateApiClient } from "../hooks/use-api";

const queryClient = new QueryClient();

function ApiProviderBridge({ children }: { children: React.ReactNode }) {
  const client = useCreateApiClient();
  return <ApiProvider client={client}>{children}</ApiProvider>;
}

export default function RootLayout() {
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <ApiProviderBridge>
          <KeyboardProvider>
            <View className="flex-1">
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                  name="chat"
                  options={{
                    presentation: "fullScreenModal",
                    headerShown: false,
                  }}
                />
              </Stack>
              <ChatFAB />
            </View>
          </KeyboardProvider>
        </ApiProviderBridge>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
