import { useAuth } from "@clerk/expo";
import { AuthView } from "@clerk/expo/native";
import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false });
  const router = useRouter();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isSignedIn) {
    return <AuthView mode="signInOrUp" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#0D0D0D" }}>
          Dashboard
        </Text>
        <Text style={{ fontSize: 15, color: "#6E6E80", marginTop: 8 }}>
          Your daily calorie overview
        </Text>
      </View>

      {/* Floating chat button */}
      <Pressable
        onPress={() => router.push("/chat")}
        style={{
          position: "absolute",
          bottom: 40,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#10A37F",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 24 }}>💬</Text>
      </Pressable>
    </SafeAreaView>
  );
}
