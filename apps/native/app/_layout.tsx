import { Stack } from "expo-router";
import { View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ChatFAB } from "../components";
import { ClerkProvider } from "../components/clerk-provider";
import "../global.css";

export default function RootLayout() {
  return (
    <ClerkProvider>
      <KeyboardProvider>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="chat"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
          </Stack>
          <ChatFAB />
        </View>
      </KeyboardProvider>
    </ClerkProvider>
  );
}
