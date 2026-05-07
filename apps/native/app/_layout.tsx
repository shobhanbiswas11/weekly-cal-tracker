import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <KeyboardProvider>
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
    </KeyboardProvider>
  );
}
