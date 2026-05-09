import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export function AssistantAvatar() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✦</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 1,
    flexShrink: 0,
  },
  icon: {
    color: theme.colors.primaryForeground,
    fontSize: 13,
    fontWeight: "700",
  },
}));
