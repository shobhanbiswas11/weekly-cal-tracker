import { AppProviders, AuthView, ChatFAB, UnauthView } from "@/components";
import { useAppAuth } from "@/hooks";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const { isLoaded, isSignedIn } = useAppAuth();

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

  return (
    <AuthView>
      <View className="flex-1">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
            name="profile/subscription"
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
    </AuthView>
  );
}

export default function WithProviderAppLayout() {
  return (
    <AppProviders>
      <RootLayout />
    </AppProviders>
  );
}
