import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { C } from "./constants";

export function Header() {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: C.border,
        backgroundColor: C.bg,
      }}
    >
      <View style={{ width: 44 }} />
      <Text style={{ fontSize: 17, fontWeight: "600", color: C.textPrimary }}>
        Calorie Coach
      </Text>
      <Pressable onPress={() => router.back()}>
        <Text style={{ fontSize: 16, color: C.accent, fontWeight: "500" }}>
          Done
        </Text>
      </Pressable>
    </View>
  );
}
