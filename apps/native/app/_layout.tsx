import { useCreateApiClient } from "@/hooks";
import { useAuth } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiProvider } from "@weekly-cal/frontend";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AuthView, ChatFAB, UnauthView } from "../components";
import { ClerkProvider } from "../components/clerk-provider";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ApiProviderBridge({ children }: { children: React.ReactNode }) {
  const client = useCreateApiClient();
  return <ApiProvider client={client}>{children}</ApiProvider>;
}

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <UnauthView />;
  }

  return <AuthView>{children}</AuthView>;
}

export default function RootLayout() {
  return (
    <ClerkProvider>
      <AppBootstrap>
        <QueryClientProvider client={queryClient}>
          <ApiProviderBridge>
            <KeyboardProvider>
              <View className="flex-1">
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="chat"
                    options={{
                      presentation: "fullScreenModal",
                      headerShown: false,
                    }}
                  />
                  {/* Profile */}
                  <Stack.Screen
                    name="profile/vitals"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/edit-vitals"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="profile/preferences"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/edit-preferences"
                    options={{
                      presentation: "modal",
                      headerShown: false,
                    }}
                  />
                </Stack>
                <ChatFAB />
              </View>
            </KeyboardProvider>
          </ApiProviderBridge>
        </QueryClientProvider>
      </AppBootstrap>
    </ClerkProvider>
  );
}
