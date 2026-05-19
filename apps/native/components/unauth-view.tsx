import { AuthView as ClerkAuthView } from "@clerk/expo/native";

export function UnauthView() {
  return <ClerkAuthView mode="signInOrUp" />;
}
