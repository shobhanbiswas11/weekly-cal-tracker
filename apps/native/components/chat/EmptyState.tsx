import { Keyboard, Pressable, Text, View } from "react-native";
import { C } from "./constants";

export function EmptyState() {
  return (
    <Pressable
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 60,
      }}
      onPress={Keyboard.dismiss}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: C.accent,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 22,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "700" }}>
          ✦
        </Text>
      </View>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          color: C.textPrimary,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        How can I help you?
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: C.textSecondary,
          textAlign: "center",
          lineHeight: 22,
        }}
      >
        Ask me about your calories, macros, or nutrition goals.
      </Text>
    </Pressable>
  );
}
