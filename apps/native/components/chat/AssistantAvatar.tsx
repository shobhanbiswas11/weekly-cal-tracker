import { Text, View } from "react-native";
import { C } from "./constants";

export function AssistantAvatar() {
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: C.accent,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginTop: 1,
        flexShrink: 0,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>✦</Text>
    </View>
  );
}
